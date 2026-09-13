import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function formatDDMMYY(date: Date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}${m}${y}`;
}

function generateId(prefix: string, date: Date, urutan: number) {
  const dateStr = formatDDMMYY(date);
  const urutanStr = String(urutan).padStart(3, '0');
  return `${prefix}${dateStr}${urutanStr}`;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItems(array: any[], count: number) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomizeTime(date: Date, startHour: number, endHour: number) {
  const newDate = new Date(date);
  newDate.setHours(
    getRandomInt(startHour, endHour),
    getRandomInt(0, 59),
    getRandomInt(0, 59),
    0,
  );
  return newDate;
}

// ============================================================================
// MAIN SEEDER LOGIC
// ============================================================================
async function main() {
  console.log(
    '🚀 Mulai generate data simulasi (Sept 2024 - Mar 2026) dengan Order Selang-Seling...',
  );

  const pelanggan = await prisma.pelanggan.findMany();
  const pegawai = await prisma.pegawai.findFirst({ where: { role: 'ADMIN' } });
  const semuaBarang = await prisma.barang.findMany({
    include: { kategori: true },
  });

  if (!pegawai || pelanggan.length === 0 || semuaBarang.length === 0) {
    throw new Error(
      'Data Master (Pegawai, Pelanggan, atau Barang) belum ada di DB!',
    );
  }

  const barangSayurBuah = semuaBarang.filter(
    (b) => b.kategori.kode === 'K001' || b.kategori.kode === 'K003',
  );
  const barangBumbuMentah = semuaBarang.filter(
    (b) => b.kategori.kode === 'K002' || b.kategori.kode === 'K004',
  );

  const kataKunciLangganan = [
    'bayam',
    'kangkung',
    'glandir',
    'gingseng',
    'buncis',
    'brokoli',
    'tempe',
    'tomat',
    'timun',
    'bawang',
    'cabai',
    'beras',
    'telur',
  ];
  const barangLangganan = semuaBarang.filter((b) =>
    kataKunciLangganan.some((k) => b.nama.toLowerCase().includes(k)),
  );
  const barangRandom = semuaBarang.filter(
    (b) => !kataKunciLangganan.some((k) => b.nama.toLowerCase().includes(k)),
  );

  const globalStockTracker = new Map<string, number>();
  const lotFifoQueue = new Map<string, { lotId: string; qty: number }[]>();

  // ==========================================================================
  // FASE 0: INJEKSI SALDO AWAL (31 AGUSTUS 2024)
  // ==========================================================================
  console.log('📦 Memproses Saldo Awal Gudang...');
  const tglSaldoAwal = new Date('2024-08-31T23:59:59Z');

  const lotAwalId = generateId('LOT', tglSaldoAwal, 0);
  const lotAwal = await prisma.nomorLot.create({
    data: { kode: lotAwalId, createdAt: tglSaldoAwal, updatedAt: tglSaldoAwal },
  });

  const detailMasukAwal: any[] = [];
  const dbLotUpdatesAwal: any[] = [];
  let totalHargaAwal = 0;

  semuaBarang.forEach((b) => {
    const stokAwal = b.stok; // Baca stok awal dari database
    globalStockTracker.set(b.id, stokAwal);

    if (stokAwal > 0) {
      lotFifoQueue.set(b.id, [{ lotId: lotAwal.id, qty: stokAwal }]);
      totalHargaAwal += stokAwal * Number(b.harga);

      detailMasukAwal.push({
        barang_id: b.id,
        jumlah: stokAwal,
        hargaSatuan: b.harga,
      });
      dbLotUpdatesAwal.push({
        nomorLot_id: lotAwal.id,
        barang_id: b.id,
        totalBarang: stokAwal,
      });
    } else {
      lotFifoQueue.set(b.id, []);
    }
  });

  if (detailMasukAwal.length > 0) {
    const trmAwalId = generateId('TRM', tglSaldoAwal, 0);
    await prisma.transaksiBarangMasuk.create({
      data: {
        id: trmAwalId,
        nomorLot_id: lotAwal.id,
        tanggal: tglSaldoAwal,
        hargaTotal: totalHargaAwal,
        createdAt: tglSaldoAwal,
        updatedAt: tglSaldoAwal,
        barang: { create: detailMasukAwal },
      },
    });
    await prisma.detailNomorLotBarang.createMany({ data: dbLotUpdatesAwal });
  }

  // ==========================================================================
  // FASE 1: SIMULASI HARIAN (Sept 2024 - Mar 2026)
  // ==========================================================================
  const currentDate = new Date('2024-09-01T00:00:00Z');
  const endDate = new Date('2026-07-18T00:00:00Z');

  let urutanMasuk = 1,
    urutanPermintaan = 1,
    urutanKeluar = 1,
    urutanLot = 1;
  let queuePermintaan: any[] = [];

  while (currentDate <= endDate) {
    const hariKe = Math.floor(
      (currentDate.getTime() - new Date('2024-09-01T00:00:00Z').getTime()) /
        (1000 * 60 * 60 * 24),
    );
    urutanMasuk = 1;
    urutanPermintaan = 1;
    urutanKeluar = 1;
    urutanLot = 1;

    // ------------------------------------------------------------------------
    // LOGIKA A: BARANG MASUK
    // ------------------------------------------------------------------------
    const isRestokSayur = hariKe % 3 === 0;
    const isRestokBumbu = hariKe % 6 === 0;

    if (isRestokSayur || isRestokBumbu) {
      const itemsToBuy = [];
      if (isRestokSayur)
        itemsToBuy.push(
          ...getRandomItems(barangSayurBuah, getRandomInt(15, 30)),
        );
      if (isRestokBumbu)
        itemsToBuy.push(
          ...getRandomItems(barangBumbuMentah, getRandomInt(20, 35)),
        );

      let totalHargaBeli = 0;
      const detailMasukData: any[] = [];
      const dbLotUpdates: any[] = [];

      const waktuMasuk = randomizeTime(currentDate, 5, 8);
      const lotIdStr = generateId('LOT', waktuMasuk, urutanLot++);
      const nomorLot = await prisma.nomorLot.create({
        data: { kode: lotIdStr, createdAt: waktuMasuk, updatedAt: waktuMasuk },
      });

      for (const b of itemsToBuy) {
        const currentStok = globalStockTracker.get(b.id) || 0;
        const isLangganan = kataKunciLangganan.some((k) =>
          b.nama.toLowerCase().includes(k),
        );
        let qtyToBuy = 0;

        if (b.kategori.kode === 'K001' || b.kategori.kode === 'K003') {
          if (currentStok > 15) continue;
          qtyToBuy = isLangganan ? getRandomInt(15, 25) : getRandomInt(3, 8);
        } else {
          if (currentStok > 30) continue;
          qtyToBuy = isLangganan ? getRandomInt(20, 35) : getRandomInt(10, 20);
        }

        if (qtyToBuy > 0) {
          const hargaBeli = Number(b.harga);
          totalHargaBeli += qtyToBuy * hargaBeli;

          detailMasukData.push({
            barang_id: b.id,
            jumlah: qtyToBuy,
            hargaSatuan: hargaBeli,
          });
          dbLotUpdates.push({
            nomorLot_id: nomorLot.id,
            barang_id: b.id,
            totalBarang: qtyToBuy,
          });

          globalStockTracker.set(b.id, currentStok + qtyToBuy);
          lotFifoQueue.get(b.id)!.push({ lotId: nomorLot.id, qty: qtyToBuy });
        }
      }

      if (detailMasukData.length > 0) {
        const trxMasukId = generateId('TRM', waktuMasuk, urutanMasuk++);
        await prisma.transaksiBarangMasuk.create({
          data: {
            id: trxMasukId,
            nomorLot_id: nomorLot.id,
            tanggal: waktuMasuk,
            hargaTotal: totalHargaBeli,
            createdAt: waktuMasuk,
            updatedAt: waktuMasuk,
            barang: { create: detailMasukData },
          },
        });

        await prisma.detailNomorLotBarang.createMany({ data: dbLotUpdates });

        for (const d of detailMasukData) {
          await prisma.barang.update({
            where: { id: d.barang_id },
            data: {
              stok: globalStockTracker.get(d.barang_id),
              pembelianTerakhir: waktuMasuk,
            },
          });
        }
      }
    }

    // ------------------------------------------------------------------------
    // LOGIKA B: PERMINTAAN RESTORAN (SISTEM SELANG-SELING)
    // ------------------------------------------------------------------------
    for (let i = 0; i < pelanggan.length; i++) {
      const p = pelanggan[i];

      // LOGIKA SELANG-SELING:
      // Restoran index 0 order di hari Genap, Restoran index 1 order di hari Ganjil
      if (hariKe % 2 === i % 2) {
        const reqLangganan = getRandomItems(
          barangLangganan,
          getRandomInt(10, 18),
        );
        const reqRandom = getRandomItems(barangRandom, getRandomInt(3, 8));
        const itemsRequested = [...reqLangganan, ...reqRandom];

        const waktuRequest = randomizeTime(currentDate, 19, 22);
        const reqId = generateId('PB', waktuRequest, urutanPermintaan++);

        const detailReqData = itemsRequested.map((b) => ({
          barang_id: b.id,
          jumlah: getRandomInt(3, 10),
        }));

        const permintaan = await prisma.permintaanBarang.create({
          data: {
            id: reqId,
            pelanggan_id: p.id,
            tanggal: waktuRequest,
            permintaanTerpenuhi: true,
            pegawai_id: pegawai.id,
            createdAt: waktuRequest,
            updatedAt: waktuRequest,
            barang: { create: detailReqData },
          },
        });

        // Barang dikirim BESOK harinya
        const besok = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        queuePermintaan.push({
          permintaan_id: permintaan.id,
          details: detailReqData,
          tanggalKirim: randomizeTime(besok, 8, 13),
        });
      }
    }

    // ------------------------------------------------------------------------
    // LOGIKA C: PENGIRIMAN (BARANG KELUAR) FIFO
    // ------------------------------------------------------------------------
    const pengirimanHariIni = queuePermintaan.filter(
      (q) => q.tanggalKirim.getDate() === currentDate.getDate(),
    );

    for (const kirim of pengirimanHariIni) {
      let totalHargaJual = 0;
      const detailKeluarData: any[] = [];
      const updateLotDbTasks: any[] = [];

      for (const d of kirim.details) {
        let remainingToFulfill = d.jumlah;
        const b = semuaBarang.find((item) => item.id === d.barang_id);
        const hargaJual = Number((b as any).harga_jual);

        const availableLots = lotFifoQueue.get(d.barang_id)!;

        for (
          let i = 0;
          i < availableLots.length && remainingToFulfill > 0;
          i++
        ) {
          const lot = availableLots[i];

          if (lot.qty > 0) {
            const qtyDiambil = Math.min(lot.qty, remainingToFulfill);

            lot.qty -= qtyDiambil;
            remainingToFulfill -= qtyDiambil;
            totalHargaJual += qtyDiambil * hargaJual;

            detailKeluarData.push({
              barang_id: d.barang_id,
              nomorLot_id: lot.lotId,
              jumlah: qtyDiambil,
              hargaSatuan: hargaJual,
            });

            updateLotDbTasks.push(
              prisma.detailNomorLotBarang.update({
                where: {
                  nomorLot_id_barang_id: {
                    nomorLot_id: lot.lotId,
                    barang_id: d.barang_id,
                  },
                },
                data: { totalBarang: lot.qty },
              }),
            );
          }
        }

        const activeLots = availableLots.filter((lot) => lot.qty > 0);
        lotFifoQueue.set(d.barang_id, activeLots);

        const fulfilled = d.jumlah - remainingToFulfill;
        const currentStok = globalStockTracker.get(d.barang_id) || 0;
        globalStockTracker.set(
          d.barang_id,
          Math.max(0, currentStok - fulfilled),
        );
      }

      if (detailKeluarData.length > 0) {
        const trxKeluarId = generateId(
          'TRK',
          kirim.tanggalKirim,
          urutanKeluar++,
        );
        await prisma.transaksiBarangKeluar.create({
          data: {
            id: trxKeluarId,
            permintaanBarang_id: kirim.permintaan_id,
            tanggal: kirim.tanggalKirim,
            hargaTotal: totalHargaJual,
            createdAt: kirim.tanggalKirim,
            updatedAt: kirim.tanggalKirim,
            barang: { create: detailKeluarData },
          },
        });

        await Promise.all(updateLotDbTasks);

        for (const d of kirim.details) {
          await prisma.barang.update({
            where: { id: d.barang_id },
            data: {
              stok: globalStockTracker.get(d.barang_id),
              updatedAt: kirim.tanggalKirim,
            },
          });
        }
      }
    }

    queuePermintaan = queuePermintaan.filter(
      (q) => q.tanggalKirim.getDate() !== currentDate.getDate(),
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(
    '✅ SELESAI! Data dummy (Saldo Awal + Order Selang-Seling) berhasil digenerate.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
