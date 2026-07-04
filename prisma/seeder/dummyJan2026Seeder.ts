import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { IdGenerator } from 'utils/core/idGenerator';

const prisma = new PrismaClient();

function formatDDMMYY(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

function timeIso(date: Date, hour: number, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// simple CSV loader: tries to find a 'nama' column, else uses first column
function loadBarangFromCsv(csvPath: string) {
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const namaIdx = header.indexOf('nama') !== -1 ? header.indexOf('nama') : 0;
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return { raw: line, nama: cols[namaIdx] };
  });
  return rows.map((r) => r.nama).filter(Boolean);
}

export const dummyJan2026Seeder = async () => {
  console.log('Starting dummy Jan 2026 seeder...');

  // fixed pelanggan as requested
  const pelangganFixed = [
    {
      id: 'P73528',
      nama: 'Restoran Truntum',
      telepon: '081808786886',
      email: 'truntum@truntumgama.com',
      alamat: 'Jl. Sisingamangaraja No.21, Candi, Kec. Candisari',
      createdAt: new Date('2024-12-26T07:35:27.700Z'),
      updatedAt: new Date('2024-12-26T07:35:27.700Z'),
    },
    {
      id: 'P001',
      nama: 'Restoran GAMA Seafood',
      telepon: '085693185670',
      email: 'info@gamaseafood.com',
      alamat: 'Jl. M.T. Haryono no. 870A Semarang',
      createdAt: new Date('2024-09-07T10:50:25.627Z'),
      updatedAt: new Date('2024-12-26T07:37:51.681Z'),
    },
  ];

  // ensure pelanggan exist (upsert)
  for (const p of pelangganFixed) {
    await prisma.pelanggan.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // pegawai admin id from repo userSeeder
  const pegawaiId = '09f5b80f-45a5-4cb7-a969-73a03c482ef8';

  // load barang names from provided CSV (attachment path)
  const csvPath = path.resolve('c:/Users/User/Desktop/barang.csv');
  let csvNames: string[] = [];
  try {
    csvNames = loadBarangFromCsv(csvPath);
  } catch (e) {
    console.warn(
      'Failed to load barang.csv, falling back to existing DB barang list',
    );
  }

  // load existing barang master and map by name
  const barangList = await prisma.barang.findMany();
  const barangByName: Record<string, any> = {};
  for (const b of barangList) barangByName[b.nama] = b;

  // ensure barang from CSV exist in DB (create if missing)
  const chosenNames: string[] = [];
  if (csvNames.length > 0) {
    for (const name of csvNames) {
      let barang = barangByName[name];
      if (!barang) {
        // create minimal barang record using IdGenerator
        const newId = IdGenerator.itemId();
        barang = await prisma.barang.create({
          data: {
            id: newId,
            nama: name,
            kategori_id: barangList[0]?.kategori_id || '',
            satuan_id: barangList[0]?.satuan_id || '',
            stok: 0,
            harga: 0,
            pembelianTerakhir: new Date(),
          },
        });
        barangByName[name] = barang;
      }
      chosenNames.push(name);
    }
  } else {
    // fallback: use all existing barang names
    for (const b of barangList) chosenNames.push(b.nama);
  }

  if (chosenNames.length === 0) throw new Error('No barang available to seed.');

  // schedule incoming lots every ~6 days in Jan 2026
  const lotDates = [1, 7, 13, 19, 25, 31].map((d) => new Date(2026, 0, d));

  // keep a per-lot inventory map: { lotId: { barangId: qty } }
  const lotInventory: Record<string, Record<string, number>> = {};

  // per-day sequence counters
  const seqCounters: Record<string, Record<string, number>> = {
    PB: {},
    TRM: {},
    TRK: {},
    LOT: {},
  };
  function nextSeq(prefix: 'PB' | 'TRM' | 'TRK' | 'LOT', dateKey: string) {
    seqCounters[prefix][dateKey] = (seqCounters[prefix][dateKey] || 0) + 1;
    return String(seqCounters[prefix][dateKey]).padStart(3, '0');
  }

  // create lots and transaksi masuk
  for (const date of lotDates) {
    const lotId = uuidv4();
    const dd = formatDDMMYY(date);
    const lotSeq = nextSeq('LOT', dd);
    const kode = `LOT${dd}${lotSeq}`; // LOTDDMMYYNNN

    await prisma.nomorLot.create({
      data: { id: lotId, kode, createdAt: date },
    });

    const trmSeq = nextSeq('TRM', dd);
    const trmId = `TRM${dd}${trmSeq}`;
    await prisma.transaksiBarangMasuk.create({
      data: { id: trmId, nomorLot_id: lotId, tanggal: date, hargaTotal: 0 },
    });

    lotInventory[lotId] = {};

    // for each chosen barang, create an incoming detail with realistic qty
    for (const name of chosenNames) {
      const barang = barangByName[name];
      if (!barang) continue;

      // quantity heuristics by name (simple)
      const qty = Math.max(1, Math.floor(10 + Math.random() * 40));

      await prisma.detailTransaksiBarangMasuk.create({
        data: {
          transaksiBarangMasuk_id: trmId,
          barang_id: barang.id,
          jumlah: qty,
          hargaSatuan: barang.harga,
        },
      });

      await prisma.detailNomorLotBarang.create({
        data: { nomorLot_id: lotId, barang_id: barang.id, totalBarang: qty },
      });

      lotInventory[lotId][barang.id] =
        (lotInventory[lotId][barang.id] || 0) + qty;
    }
  }

  // helper: allocate FIFO from lots for a requested barang
  const allocate = (barangId: string, need: number) => {
    let remaining = need;
    const allocations: Array<{ lotId: string; qty: number }> = [];
    const lotsSorted = Object.keys(lotInventory); // insertion order preserved

    for (const lotId of lotsSorted) {
      const avail = lotInventory[lotId][barangId] || 0;
      if (avail <= 0) continue;
      const take = Math.min(avail, remaining);
      if (take > 0) {
        lotInventory[lotId][barangId] = avail - take;
        remaining -= take;
        allocations.push({ lotId, qty: take });
      }
      if (remaining <= 0) break;
    }
    return { fulfilled: need - remaining, allocations };
  };

  // create permintaan every 2 days from Jan 1 to Jan 31
  const permintaanDates: Date[] = [];
  for (let d = 1; d <= 31; d += 2) permintaanDates.push(new Date(2026, 0, d));

  // track per-barang totals for final stock calc
  const totalsIn: Record<string, number> = {};
  const totalsOut: Record<string, number> = {};

  // compute totalsIn from lotInventory initial sums
  for (const lotId of Object.keys(lotInventory)) {
    for (const [barangId, qty] of Object.entries(lotInventory[lotId])) {
      totalsIn[barangId] = (totalsIn[barangId] || 0) + qty;
    }
  }

  // create permintaan and corresponding transaksi keluar (fulfilled next day)
  for (const date of permintaanDates) {
    const dd = formatDDMMYY(date);
    const pbSeq = nextSeq('PB', dd);
    const pbId = `PB${dd}${pbSeq}`;
    // alternate pelanggan
    const pelanggan = pelangganFixed[Math.random() < 0.5 ? 0 : 1];
    const requestedAt =
      Math.random() < 0.6 ? timeIso(date, 9, 0) : timeIso(date, 13, 0);

    // create permintaan
    await prisma.permintaanBarang.create({
      data: {
        id: pbId,
        pelanggan_id: pelanggan.id,
        tanggal: new Date(requestedAt),
        permintaanTerpenuhi: false,
        pegawai_id: pegawaiId,
      },
    });

    // pick 2-4 random items for this permintaan
    const items = shuffleArray(chosenNames).slice(
      0,
      2 + Math.floor(Math.random() * 3),
    );
    const detailRequests: Array<{ barangId: string; jumlah: number }> = [];
    for (const name of items) {
      const barang = barangByName[name];
      if (!barang) continue;
      // quantity per request smaller than lot sizes
      const qty = Math.max(
        1,
        Math.floor(
          (name.includes('Bakso')
            ? 20
            : name.includes('Bayam')
              ? 6
              : name.includes('Ayam')
                ? 3
                : 4) *
            (0.6 + Math.random() * 0.8),
        ),
      );
      detailRequests.push({ barangId: barang.id, jumlah: qty });

      await prisma.detailPermintaanBarang.create({
        data: { permintaanBarang_id: pbId, barang_id: barang.id, jumlah: qty },
      });
    }

    // allocate and create transaksi keluar for next day
    const outDate = new Date(date);
    outDate.setDate(outDate.getDate() + 1);
    const trkSeq = nextSeq('TRK', dd);
    const trkId = `TRK${dd}${trkSeq}`;
    let allFulfilled = true;

    await prisma.transaksiBarangKeluar.create({
      data: {
        id: trkId,
        permintaanBarang_id: pbId,
        tanggal: outDate,
        hargaTotal: 0,
      },
    });

    for (const req of detailRequests) {
      const alloc = allocate(req.barangId, req.jumlah);
      const fulfilled = alloc.fulfilled;
      if (fulfilled < req.jumlah) allFulfilled = false;

      // create detail transaksi keluar with fulfilled qty (could be 0)
      if (fulfilled > 0) {
        const barang = await prisma.barang.findUnique({
          where: { id: req.barangId },
        });
        for (const allocation of alloc.allocations) {
          await prisma.detailTransaksiBarangKeluar.create({
            data: {
              transaksiBarangKeluar_id: trkId,
              barang_id: req.barangId,
              nomorLot_id: allocation.lotId,
              jumlah: allocation.qty,
              hargaSatuan: barang?.harga || 0,
            },
          });
        }
        totalsOut[req.barangId] = (totalsOut[req.barangId] || 0) + fulfilled;
      }
    }

    // update permintaanBarang.permintaanTerpenuhi
    await prisma.permintaanBarang.update({
      where: { id: pbId },
      data: { permintaanTerpenuhi: allFulfilled },
    });
  }

  // apply small spoilage per lot (2-6%) to simulate unsold/busuk
  for (const lotId of Object.keys(lotInventory)) {
    for (const [barangId, avail] of Object.entries(lotInventory[lotId])) {
      const spoilRate = 0.02 + Math.random() * 0.04;
      const spoil = Math.floor(avail * spoilRate);
      lotInventory[lotId][barangId] = Math.max(0, avail - spoil);
      // reduce totalsIn accordingly (count spoilage as removed)
      totalsIn[barangId] = (totalsIn[barangId] || 0) - spoil;
    }
  }

  // compute final stock per barang: starting stok (db) + sum(in) - sum(out) - spoilage
  for (const b of await prisma.barang.findMany()) {
    const inQty = totalsIn[b.id] || 0;
    const outQty = totalsOut[b.id] || 0;
    const newStok = Math.max(0, (b.stok || 0) + inQty - outQty);
    await prisma.barang.update({
      where: { id: b.id },
      data: { stok: newStok },
    });
  }

  console.log('Dummy Jan 2026 seeder finished.');
};

// small util
function shuffleArray<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// allow running directly with `node -r ts-node/register prisma/seeder/dummyJan2026Seeder.ts` (if ts-node available)
if (require.main === module) {
  dummyJan2026Seeder()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
