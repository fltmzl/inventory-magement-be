const fs = require('fs');
const path = require('path');

function parseCsvSemicolon(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
  if (!lines.length) return [];
  const header = lines[0].split(/;|,/).map(h => h.trim().toLowerCase());
  const idx = name => header.indexOf(name);
  const rows = lines.slice(1).map(line => line.split(/;|,/).map(c => c.trim()));
  return rows.map(r => ({ id: r[idx('id')] || r[0], nama: r[idx('nama')] || r[1], harga: Number(r[idx('harga')] || 0) }));
}

function roundDown100(n) {
  return Math.max(100, Math.floor(n / 100) * 100);
}

function safeFactor() {
  // pick factor between 0.55 and 0.85
  return 0.55 + Math.random() * 0.3;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const csvPath = path.resolve(repoRoot, '..', 'barang.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('barang.csv not found at', csvPath);
    process.exit(1);
  }
  const barangs = parseCsvSemicolon(csvPath);
  const byId = {};
  const byName = {};
  for (const b of barangs) {
    byId[b.id] = b;
    byName[b.nama] = b;
  }

  const jsonPath = path.resolve(repoRoot, 'dummyJan2026.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('dummyJan2026.json not found at', jsonPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  // update purchase prices in detail_transaksi_barang_masuk
  const dtm = data.detail_transaksi_barang_masuk || [];
  for (const line of dtm) {
    const bid = line.barang_id || line.barang_id || null;
    let sell = 0;
    if (bid && byId[bid]) sell = byId[bid].harga;
    if (!sell && line.barang_nama && byName[line.barang_nama]) sell = byName[line.barang_nama].harga;
    if (!sell) sell = line.hargaSatuan || 0;

    // choose factor and compute buy price < sell
    let buy = Math.floor(sell * (0.55 + Math.random() * 0.3));
    buy = roundDown100(buy);
    if (buy >= sell) buy = Math.max(100, roundDown100(sell - 100));
    line.hargaSatuan = buy;
  }

  // recompute transaksi_barang_masuk.hargaTotal
  const tbm = data.transaksi_barang_masuk || [];
  const mapTbm = {};
  for (const t of tbm) mapTbm[t.id] = t;
  for (const t of tbm) t.hargaTotal = 0;
  for (const line of dtm) {
    const t = mapTbm[line.transaksiBarangMasuk_id];
    if (t) t.hargaTotal = (t.hargaTotal || 0) + (line.jumlah || 0) * (line.hargaSatuan || 0);
  }

  // ensure detail_transaksi_barang_keluar hargaSatuan = selling price and recompute transaksi_barang_keluar.hargaTotal
  const dtk = data.detail_transaksi_barang_keluar || [];
  for (const line of dtk) {
    const bid = line.barang_id || null;
    let sell = 0;
    if (bid && byId[bid]) sell = byId[bid].harga;
    if (!sell && line.barang_nama && byName[line.barang_nama]) sell = byName[line.barang_nama].harga;
    if (!sell) sell = line.hargaSatuan || 0;
    // selling price must be multiple of 100 as well
    line.hargaSatuan = roundDown100(sell);
  }
  const tbk = data.transaksi_barang_keluar || [];
  const mapTrk = {};
  for (const t of tbk) mapTrk[t.id] = t;
  for (const t of tbk) t.hargaTotal = 0;
  for (const line of dtk) {
    const t = mapTrk[line.transaksiBarangKeluar_id];
    if (t) t.hargaTotal = (t.hargaTotal || 0) + (line.jumlah || 0) * (line.hargaSatuan || 0);
  }

  // write back
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

  // produce summary
  const out = {
    permintaanBarang: (data.permintaan_barang || []).length,
    transaksiMasuk: (data.transaksi_barang_masuk || []).length,
    transaksiKeluar: (data.transaksi_barang_keluar || []).length,
    detailTransMasuk: (data.detail_transaksi_barang_masuk || []).length,
    detailNomorLot: (data.detail_nomor_lot_barang || []).length,
    detailPermintaan: (data.detail_permintaan_barang || []).length,
    detailTransKeluar: (data.detail_transaksi_barang_keluar || []).length,
    sumTRM: (data.transaksi_barang_masuk || []).reduce((s, x) => s + (x.hargaTotal || 0), 0),
    sumTRK: (data.transaksi_barang_keluar || []).reduce((s, x) => s + (x.hargaTotal || 0), 0),
    avgDetailPerPermintaan: ((data.detail_permintaan_barang || []).length) / Math.max(1, (data.permintaan_barang || []).length),
    distinctBarangInPermintaan: new Set((data.detail_permintaan_barang || []).map(x => x.barang_id)).size
  };

  console.log(JSON.stringify(out, null, 2));
}

main();
