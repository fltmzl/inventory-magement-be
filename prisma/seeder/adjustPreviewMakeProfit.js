const fs = require('fs');
const path = require('path');

function parseCsv(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(/;|,/).map((h) => h.trim().toLowerCase());
  const idx = (name) => header.indexOf(name);
  const rows = lines.slice(1).map((line) => line.split(/;|,/).map((c) => c.trim()));
  const map = {};
  for (const r of rows) {
    const id = r[idx('id')] || r[0];
    const nama = r[idx('nama')] || r[1];
    const harga = Number(r[idx('harga')] || 0);
    if (id) map[id] = { id, nama, harga };
  }
  return map;
}

function round(n) { return Math.round(n); }

const jsonPath = path.resolve(__dirname, 'dummyJan2026.json');
const csvPath = path.resolve(__dirname, '..', '..', 'barang.csv');
if (!fs.existsSync(jsonPath)) { console.error('preview JSON not found:', jsonPath); process.exit(1); }
if (!fs.existsSync(csvPath)) { console.error('barang.csv not found:', csvPath); process.exit(1); }

const csv = parseCsv(csvPath);
const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Ensure outgoing detail hargaSatuan equals selling price
for (const d of doc.detail_transaksi_barang_keluar || []) {
  const info = csv[d.barang_id];
  if (info && info.harga > 0) d.hargaSatuan = info.harga;
}

// Set incoming purchase price to a fraction of selling price
for (const d of doc.detail_transaksi_barang_masuk || []) {
  const info = csv[d.barang_id];
  const jual = info && info.harga ? info.harga : (d.hargaSatuan || 0);
  // initial factor 35%..55%
  const factor = 0.35 + Math.random() * 0.2;
  const beli = Math.max(1, round(jual * factor));
  d.hargaSatuan = beli;
}

// recompute transaksi_barang_masuk.hargaTotal
const trmMap = {};
for (const t of doc.transaksi_barang_masuk || []) trmMap[t.id] = 0;
for (const d of doc.detail_transaksi_barang_masuk || []) {
  const tId = d.transaksiBarangMasuk_id;
  trmMap[tId] = (trmMap[tId] || 0) + (Number(d.jumlah || 0) * Number(d.hargaSatuan || 0));
}
for (const t of doc.transaksi_barang_masuk || []) t.hargaTotal = round(trmMap[t.id] || 0);

// recompute transaksi_barang_keluar.hargaTotal from detail
const trkMap = {};
for (const t of doc.transaksi_barang_keluar || []) trkMap[t.id] = 0;
for (const d of doc.detail_transaksi_barang_keluar || []) {
  const tId = d.transaksiBarangKeluar_id;
  trkMap[tId] = (trkMap[tId] || 0) + (Number(d.jumlah || 0) * Number(d.hargaSatuan || 0));
}
for (const t of doc.transaksi_barang_keluar || []) t.hargaTotal = round(trkMap[t.id] || 0);

function sum(arr, field) { return (arr || []).reduce((s, x) => s + Number(x[field] || 0), 0); }

let sumTRM = sum(doc.transaksi_barang_masuk, 'hargaTotal');
const sumTRK = sum(doc.transaksi_barang_keluar, 'hargaTotal');

console.log('Before scaling: sumTRM=', sumTRM, 'sumTRK=', sumTRK);

// If purchases still >= sales, scale down incoming prices proportionally to get purchases to ~85% of sales
if (sumTRM >= sumTRK) {
  const target = Math.max(0, sumTRK * 0.85);
  const scale = target / sumTRM;
  const minScale = 0.2; // don't go below 20% of current purchase prices
  const appliedScale = Math.max(scale, minScale);
  // apply scaling
  for (const d of doc.detail_transaksi_barang_masuk || []) {
    const old = Number(d.hargaSatuan || 0);
    const nw = Math.max(1, round(old * appliedScale));
    d.hargaSatuan = nw;
  }
  // recompute totals
  for (const t of doc.transaksi_barang_masuk || []) trmMap[t.id] = 0;
  for (const d of doc.detail_transaksi_barang_masuk || []) trmMap[d.transaksiBarangMasuk_id] = (trmMap[d.transaksiBarangMasuk_id] || 0) + (Number(d.jumlah || 0) * Number(d.hargaSatuan || 0));
  for (const t of doc.transaksi_barang_masuk || []) t.hargaTotal = round(trmMap[t.id] || 0);
  sumTRM = sum(doc.transaksi_barang_masuk, 'hargaTotal');
  console.log('After scaling: sumTRM=', sumTRM, 'sumTRK=', sumTRK, 'appliedScale=', appliedScale.toFixed(3));
} else {
  console.log('No scaling needed, purchases already below sales.');
}

// write back file
fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2), 'utf8');
console.log('Wrote adjusted preview to', jsonPath);

// print final summary
const summary = {
  permintaanBarang: (doc.permintaan_barang || []).length,
  transaksiMasuk: (doc.transaksi_barang_masuk || []).length,
  transaksiKeluar: (doc.transaksi_barang_keluar || []).length,
  detailTransMasuk: (doc.detail_transaksi_barang_masuk || []).length,
  detailNomorLot: (doc.detail_nomor_lot_barang || []).length,
  detailPermintaan: (doc.detail_permintaan_barang || []).length,
  detailTransKeluar: (doc.detail_transaksi_barang_keluar || []).length,
  sumTRM: sum(doc.transaksi_barang_masuk, 'hargaTotal'),
  sumTRK: sum(doc.transaksi_barang_keluar, 'hargaTotal'),
};
console.log(JSON.stringify(summary, null, 2));
