import * as fs from 'fs';
import * as path from 'path';

type Barang = { id: string; nama: string; harga: number };

function parseCsvSemicolon(csvPath: string) {
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [] as any[];
  const header = lines[0].split(/;|,/).map((h) => h.trim().toLowerCase());
  const cols = (name: string) => header.indexOf(name);
  const rows = lines.slice(1).map((line) => line.split(/;|,/).map((c) => c.trim()));
  return rows.map((r) => {
    return {
      id: r[cols('id')] || r[0],
      nama: r[cols('nama')] || r[1],
      harga: Number(r[cols('harga')] || 0),
    } as Barang;
  });
}

function formatDDMMYY(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

function iso(date: Date, hour = 8, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// per-day seq counters
const seq: Record<string, Record<string, number>> = { PB: {}, TRM: {}, TRK: {}, LOT: {} };
function nextSeq(key: 'PB' | 'TRM' | 'TRK' | 'LOT', dateKey: string) {
  seq[key][dateKey] = (seq[key][dateKey] || 0) + 1;
  return String(seq[key][dateKey]).padStart(3, '0');
}

function money(n: number) {
  return Math.round(n);
}

function pickCoreAndOccasional(barangs: Barang[], coreCount = 12) {
  const core = barangs.slice(0, Math.min(coreCount, barangs.length)).map((b) => b);
  const occasional = barangs.slice(coreCount);
  return { core, occasional };
}

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

async function main() {
  const csvPath = path.resolve(__dirname, '..', '..', 'barang.csv');
  if (!fs.existsSync(csvPath)) throw new Error(`barang.csv not found at ${csvPath}`);
  const barangs = parseCsvSemicolon(csvPath) as Barang[];
  if (barangs.length === 0) throw new Error('No barang rows parsed');

  // fixed pelanggan
  const pelanggan = [
    { id: 'P73528', nama: 'Restoran Truntum', telepon: '081808786886', email: 'truntum@truntumgama.com', alamat: 'Jl. Sisingamangaraja No.21' },
    { id: 'P001', nama: 'Restoran GAMA Seafood', telepon: '085693185670', email: 'info@gamaseafood.com', alamat: 'Jl. M.T. Haryono no. 870A Semarang' },
  ];

  // lot dates
  const lotDates = [1, 7, 13, 19, 25, 31].map((d) => new Date(2026, 0, d));

  // core/occasional split
  const { core, occasional } = pickCoreAndOccasional(barangs, 12);

  const nomor_lot: any[] = [];
  const transaksi_barang_masuk: any[] = [];
  const detail_transaksi_barang_masuk: any[] = [];
  const detail_nomor_lot_barang: any[] = [];

  // create lots and incoming with varied details
  for (const date of lotDates) {
    const dd = formatDDMMYY(date);
    const lotSeq = nextSeq('LOT', dd);
    const lotId = `lot-2026${dd}-${lotSeq}`; // simple reproducible id
    const kode = `LOT${dd}${lotSeq}`;
    nomor_lot.push({ id: lotId, kode, createdAt: iso(date), notes: 'simulated lot' });

    const trmSeq = nextSeq('TRM', dd);
    const trmId = `TRM${dd}${trmSeq}`;

    // choose items: always include core, plus random sample of occasional
    const occSample = shuffle(occasional).slice(0, 10 + Math.floor(Math.random() * 15));
    const itemsThisLot = core.concat(occSample);

    let trmTotal = 0;
    for (const b of itemsThisLot) {
      // qty depends on type: core items higher avg
      const base = core.find((c) => c.id === b.id) ? 30 : 8;
      const qty = Math.max(1, Math.floor(base * (0.5 + Math.random() * 1.5)));
      const hargaSatuan = money(b.harga || 0);
      const lineTotal = qty * hargaSatuan;
      trmTotal += lineTotal;

      detail_transaksi_barang_masuk.push({ transaksiBarangMasuk_id: trmId, barang_id: b.id, barang_nama: b.nama, jumlah: qty, hargaSatuan });
      detail_nomor_lot_barang.push({ nomorLot_id: lotId, barang_id: b.id, barang_nama: b.nama, totalBarang: qty });
    }

    transaksi_barang_masuk.push({ id: trmId, nomorLot_id: lotId, tanggal: iso(date, 8), hargaTotal: money(trmTotal) });
  }

  // permintaan: every 2 days with 15-20 items
  const permintaan_barang: any[] = [];
  const detail_permintaan_barang: any[] = [];
  const transaksi_barang_keluar: any[] = [];
  const detail_transaksi_barang_keluar: any[] = [];

  for (let d = 1; d <= 31; d += 2) {
    const date = new Date(2026, 0, d);
    const dd = formatDDMMYY(date);
    const pbSeq = nextSeq('PB', dd);
    const pbId = `PB${dd}${pbSeq}`;
    const pelangganChosen = Math.random() < 0.5 ? pelanggan[0] : pelanggan[1];
    const waktu = Math.random() < 0.6 ? iso(date, 9) : iso(date, 13);
    permintaan_barang.push({ id: pbId, pelanggan_id: pelangganChosen.id, tanggal: waktu, permintaanTerpenuhi: true, pegawai_id: '09f5b80f-45a5-4cb7-a969-73a03c482ef8' });

    // pick 15-20 items with mix of core (frequent) and occasional
    const nItems = 15 + Math.floor(Math.random() * 6); // 15-20
    const candidates = shuffle(core.concat(occasional));
    const items = candidates.slice(0, nItems);

    let totalOut = 0;
    const trkId = `TRK${dd}001`;
    const outDate = new Date(date);
    outDate.setDate(outDate.getDate() + 1);

    for (const b of items) {
      // requested qty smaller than lot qty
      const qty = Math.max(1, Math.floor((b.nama.toLowerCase().includes('bakso') ? 10 : b.nama.toLowerCase().includes('ayam') ? 3 : 4) * (0.8 + Math.random() * 1.4)));
      detail_permintaan_barang.push({ permintaanBarang_id: pbId, barang_id: b.id, barang_nama: b.nama, jumlah: qty });
      // outgoing uses same hargaSatuan
      detail_transaksi_barang_keluar.push({ transaksiBarangKeluar_id: trkId, barang_id: b.id, barang_nama: b.nama, jumlah: qty, hargaSatuan: money(b.harga || 0) });
      totalOut += qty * (b.harga || 0);
    }

    transaksi_barang_keluar.push({ id: trkId, permintaanBarang_id: pbId, tanggal: iso(outDate, 9), hargaTotal: money(totalOut) });
  }

  const out = {
    meta: { period_start: '2026-01-01', period_end: '2026-01-31', notes: 'Regenerated preview — corrected CSV source, totals computed, more realistic variety, 15-20 items per permintaan.' },
    pelanggan,
    nomor_lot,
    transaksi_barang_masuk,
    detail_transaksi_barang_masuk,
    detail_nomor_lot_barang,
    permintaan_barang,
    detail_permintaan_barang,
    transaksi_barang_keluar,
    detail_transaksi_barang_keluar,
  };

  const outPath = path.resolve(__dirname, 'dummyJan2026.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log('Wrote new preview to', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
