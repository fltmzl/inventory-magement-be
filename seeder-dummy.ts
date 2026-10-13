import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// HELPER FUNCTIONS & PROFILING BARANG AKTIF
// ============================================================================
function formatDDMMYY(date: Date) {
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = String(date.getUTCFullYear()).slice(-2);
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
  newDate.setUTCHours(
    getRandomInt(startHour, endHour),
    getRandomInt(0, 59),
    getRandomInt(0, 59),
    0,
  );
  return newDate;
}

function getRandomInitialStock() {
  const pool = [0, 0, 0, 1, 1, 2];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Daftar kata kunci bahan aktif riil yang dipesan oleh restoran aktif saat ini
const ACTIVE_ITEM_KEYWORDS = [
  'bakso',
  'bayam',
  'buncis',
  'beby buncis',
  'bengkoang',
  'brokoli',
  'daun jeruk',
  'mint',
  'pandan',
  'parsley',
  'petersely',
  'pepaya',
  'salam',
  'singkong',
  'gingseng',
  'ginseng',
  'glandir',
  'jagung',
  'jamur',
  'jeruk',
  'jipang',
  'kacang panjang',
  'kangkung',
  'kapri',
  'kemangi',
  'kembang kol',
  'ketela',
  'telo',
  'kol',
  'lele',
  'mangga',
  'pedho',
  'pete',
  'pisang',
  'pokcoy',
  'pakcoy',
  'sawi',
  'caisim',
  'selada',
  'seledri',
  'tahu',
  'tauge',
  'taoge',
  'telor',
  'telur',
  'tempe',
  'teri',
  'timun',
  'tomat',
  'unclang',
  'onclang',
  'daun bawang',
  'wortel',
  'ayam',
  'daging',
  'bawang',
  'cabai',
  'cabe',
];

/**
 * Karakteristik proporsional agar TARGET SUSUT BERADA DI KISARAN 1% - 5%
 */
function getItemProfile(nama: string) {
  const n = nama.toLowerCase();

  // Bumbu daun kering / aromatik awet (daun jeruk, salam, pandan): tahan 30 hari
  if (n.includes('daun jeruk') || n.includes('salam') || n.includes('pandan')) {
    return {
      shelfLifeDays: 30,
      isFastMoving: false,
      restockQty: [2, 4] as [number, number],
      reorderPoint: 0,
      orderQtyRange: [1, 2] as [number, number],
    };
  }

  // Jamur (hyoko, kuping, tiram, shitake): tahan 14 hari
  if (n.includes('jamur')) {
    return {
      shelfLifeDays: 14,
      isFastMoving: false,
      restockQty: [2, 4] as [number, number],
      reorderPoint: 0,
      orderQtyRange: [1, 2] as [number, number],
    };
  }

  // Daging & Ayam segar: tahan 8 hari di pendingin
  if (
    n.includes('ayam') ||
    n.includes('daging') ||
    n.includes('lele') ||
    n.includes('bakso') ||
    n.includes('teri')
  ) {
    return {
      shelfLifeDays: 8,
      isFastMoving: true,
      restockQty: [8, 14] as [number, number],
      reorderPoint: 2,
      orderQtyRange: [2, 4] as [number, number],
    };
  }

  // Sayuran daun segar (bayam, kangkung, sawi, selada, pokcoy): tahan 8 hari
  if (
    n.includes('bayam') ||
    n.includes('kangkung') ||
    n.includes('sawi') ||
    n.includes('selada') ||
    n.includes('pokcoy') ||
    n.includes('pakcoy') ||
    n.includes('caisim') ||
    n.includes('brokoli') ||
    n.includes('tauge') ||
    n.includes('taoge') ||
    n.includes('kemangi') ||
    n.includes('seledri') ||
    n.includes('unclang') ||
    n.includes('onclang') ||
    n.includes('glandir') ||
    n.includes('gingseng') ||
    n.includes('ginseng')
  ) {
    return {
      shelfLifeDays: 8,
      isFastMoving: true,
      restockQty: [8, 14] as [number, number],
      reorderPoint: 2,
      orderQtyRange: [2, 5] as [number, number],
    };
  }

  // Sayur buah & kedelai (tomat, terong, timun, buncis, tempe, tahu): tahan 12 hari
  if (
    n.includes('tomat') ||
    n.includes('terong') ||
    n.includes('timun') ||
    n.includes('buncis') ||
    n.includes('tempe') ||
    n.includes('tahu') ||
    n.includes('kacang panjang') ||
    n.includes('kembang kol') ||
    n.includes('jipang') ||
    n.includes('kapri')
  ) {
    return {
      shelfLifeDays: 12,
      isFastMoving:
        n.includes('tomat') ||
        n.includes('tempe') ||
        n.includes('tahu') ||
        n.includes('buncis'),
      restockQty: [8, 14] as [number, number],
      reorderPoint: 2,
      orderQtyRange: [2, 4] as [number, number],
    };
  }

  // Umbi & Sayur keras (kentang, wortel, jagung, kol, ketela, singkong): tahan 20 hari
  if (
    n.includes('kentang') ||
    n.includes('wortel') ||
    n.includes('jagung') ||
    n.includes('kol') ||
    n.includes('ketela') ||
    n.includes('telo') ||
    n.includes('singkong') ||
    n.includes('bengkoang') ||
    n.includes('labu')
  ) {
    return {
      shelfLifeDays: 20,
      isFastMoving:
        n.includes('wortel') || n.includes('jagung') || n.includes('kol'),
      restockQty: [8, 14] as [number, number],
      reorderPoint: 2,
      orderQtyRange: [2, 4] as [number, number],
    };
  }

  // Bumbu segar & buah (cabai, bawang, jeruk, pisang): tahan 25 hari
  if (
    n.includes('cabai') ||
    n.includes('cabe') ||
    n.includes('bawang') ||
    n.includes('jeruk') ||
    n.includes('pisang') ||
    n.includes('mangga')
  ) {
    return {
      shelfLifeDays: 25,
      isFastMoving:
        n.includes('bawang') || n.includes('cabai') || n.includes('cabe'),
      restockQty: [10, 16] as [number, number],
      reorderPoint: 3,
      orderQtyRange: [2, 4] as [number, number],
    };
  }

  // Default komoditas
  return {
    shelfLifeDays: 14,
    isFastMoving: false,
    restockQty: [3, 5] as [number, number],
    reorderPoint: 1,
    orderQtyRange: [1, 2] as [number, number],
  };
}

// ============================================================================
// MAIN SEEDER LOGIC
// ============================================================================
async function main() {
  console.log(
    '🚀 Memulai simulasi inventaris realistis & seimbang (Target Susut 1% - 5%)...',
  );

  // --------------------------------------------------------------------------
  // STEP 0: BERSIHKAN TRANSAKSI SIMULASI SEBELUMNYA
  // --------------------------------------------------------------------------
  console.log('🧹 Membersihkan database riwayat transaksi lama...');
  await prisma.detailTransaksiBarangKeluar.deleteMany();
  await prisma.transaksiBarangKeluar.deleteMany();
  await prisma.detailPermintaanBarang.deleteMany();
  await prisma.permintaanBarang.deleteMany();
  await prisma.detailTransaksiBarangMasuk.deleteMany();
  await prisma.transaksiBarangMasuk.deleteMany();
  await prisma.detailNomorLotBarang.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.nomorLot.deleteMany();

  // Reset semua barang ke stok 0
  await prisma.barang.updateMany({
    data: { stok: 0 },
  });

  const pelanggan = await prisma.pelanggan.findMany();
  const pegawai = await prisma.pegawai.findFirst({ where: { role: 'ADMIN' } });
  const semuaBarangMaster = await prisma.barang.findMany({
    include: { kategori: true },
  });

  if (!pegawai || pelanggan.length === 0 || semuaBarangMaster.length === 0) {
    throw new Error(
      'Data Master (Pegawai, Pelanggan, atau Barang) belum ada di DB!',
    );
  }

  // HANYA AKTIFKAN BARANG RIIL YANG DIPESAN RESTORAN
  const barangAktif = semuaBarangMaster.filter((b) =>
    ACTIVE_ITEM_KEYWORDS.some((kw) => b.nama.toLowerCase().includes(kw)),
  );
  console.log(
    `📦 Total Master Barang: ${semuaBarangMaster.length} | Barang Aktif Beroperasi: ${barangAktif.length}`,
  );

  const itemProfiles = new Map<string, ReturnType<typeof getItemProfile>>();
  barangAktif.forEach((b) => {
    itemProfiles.set(b.id, getItemProfile(b.nama));
  });

  const barangFastMoving = barangAktif.filter(
    (b) => itemProfiles.get(b.id)!.isFastMoving,
  );
  const barangSlowMoving = barangAktif.filter(
    (b) => !itemProfiles.get(b.id)!.isFastMoving,
  );

  const globalStockTracker = new Map<string, number>();
  const lotFifoQueue = new Map<
    string,
    { lotId: string; qty: number; tglMasuk: Date }[]
  >();

  barangAktif.forEach((b) => {
    globalStockTracker.set(b.id, 0);
    lotFifoQueue.set(b.id, []);
  });

  // ==========================================================================
  // FASE 0: SALDO AWAL GUDANG (31 AGUSTUS 2024)
  // ==========================================================================
  console.log('📦 Menyiapkan saldo awal gudang per 31 Agustus 2024...');
  const tglSaldoAwal = new Date('2024-08-31T23:59:59Z');

  const lotAwalId = generateId('LOT', tglSaldoAwal, 0);
  const lotAwal = await prisma.nomorLot.create({
    data: { kode: lotAwalId, createdAt: tglSaldoAwal, updatedAt: tglSaldoAwal },
  });

  const detailMasukAwal: any[] = [];
  const dbLotUpdatesAwal: any[] = [];
  const updateBarangPromises: any[] = [];
  let totalHargaAwal = 0;

  barangAktif.forEach((b) => {
    const stokAwal = getRandomInitialStock();
    globalStockTracker.set(b.id, stokAwal);

    updateBarangPromises.push(
      prisma.barang.update({
        where: { id: b.id },
        data: { stok: stokAwal, pembelianTerakhir: tglSaldoAwal },
      }),
    );

    if (stokAwal > 0) {
      lotFifoQueue.get(b.id)!.push({
        lotId: lotAwal.id,
        qty: stokAwal,
        tglMasuk: tglSaldoAwal,
      });
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
    }
  });

  await Promise.all(updateBarangPromises);

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

    const stockMovementsAwal = detailMasukAwal.map((d) => ({
      barang_id: d.barang_id,
      nomorLot_id: lotAwal.id,
      tipe: 'INITIAL' as const,
      jumlah: d.jumlah,
      stokSebelum: 0,
      stokSesudah: d.jumlah,
      referensiId: trmAwalId,
      keterangan: 'Inisialisasi Saldo Awal Gudang',
      tanggal: tglSaldoAwal,
      createdAt: tglSaldoAwal,
    }));
    await prisma.stockMovement.createMany({ data: stockMovementsAwal });
  }

  // ==========================================================================
  // FASE 1: SIMULASI HARIAN (01 Sept 2024 s/d 30 Sept 2026)
  // ==========================================================================
  console.log(
    '🔄 Menjalankan simulasi harian realistis (Sept 2024 - Sept 2026)...',
  );
  const startDate = new Date('2024-09-01T00:00:00Z');
  const currentDate = new Date(startDate);
  const endDate = new Date('2026-09-30T00:00:00Z');

  let urutanMasuk = 1,
    urutanPermintaan = 1,
    urutanKeluar = 1,
    urutanLot = 1;
  let queuePermintaan: any[] = [];

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay();
    urutanMasuk = 1;
    urutanPermintaan = 1;
    urutanKeluar = 1;
    urutanLot = 1;

    // ------------------------------------------------------------------------
    // LOGIKA 1: AUDIT SORTASI & SUSUT ALAMI UJUNG LOT (1% - 5% TARGET)
    // ------------------------------------------------------------------------
    for (const b of barangAktif) {
      const prof = itemProfiles.get(b.id)!;
      const lots = lotFifoQueue.get(b.id) || [];
      const expiredLots: { lotId: string; qty: number }[] = [];

      for (const lot of lots) {
        if (lot.qty <= 0) continue;
        const ageDays = Math.floor(
          (currentDate.getTime() - lot.tglMasuk.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (ageDays >= prof.shelfLifeDays) {
          // Susut alami ujung lot / sortasi layu (1 - 2 unit wajar)
          const qtyAfkir = Math.min(lot.qty, getRandomInt(1, 2));
          expiredLots.push({ lotId: lot.lotId, qty: qtyAfkir });
          lot.qty -= qtyAfkir;

          // Perbarui tanggal simpan sisa yang telah disortir
          if (lot.qty > 0) {
            lot.tglMasuk = new Date(
              currentDate.getTime() -
                (prof.shelfLifeDays - 3) * 24 * 60 * 60 * 1000,
            );
          }
        }
      }

      if (expiredLots.length > 0) {
        lotFifoQueue.set(
          b.id,
          lots.filter((l) => l.qty > 0),
        );

        for (const exp of expiredLots) {
          const currentStokNow = globalStockTracker.get(b.id) || 0;
          const sisaStokBaru = Math.max(0, currentStokNow - exp.qty);
          globalStockTracker.set(b.id, sisaStokBaru);

          const currentLotInDb = await prisma.detailNomorLotBarang.findUnique({
            where: {
              nomorLot_id_barang_id: {
                nomorLot_id: exp.lotId,
                barang_id: b.id,
              },
            },
          });

          await prisma.detailNomorLotBarang.update({
            where: {
              nomorLot_id_barang_id: {
                nomorLot_id: exp.lotId,
                barang_id: b.id,
              },
            },
            data: {
              totalBarang: Math.max(
                0,
                (currentLotInDb?.totalBarang || 0) - exp.qty,
              ),
            },
          });

          const waktuAfkir = randomizeTime(currentDate, 6, 7);
          await prisma.stockMovement.create({
            data: {
              barang_id: b.id,
              nomorLot_id: exp.lotId,
              tipe: 'ADJUSTMENT',
              jumlah: -exp.qty,
              stokSebelum: currentStokNow,
              stokSesudah: sisaStokBaru,
              referensiId: exp.lotId,
              keterangan: `Penyusutan/Afkir: Sortasi susut timbangan & layu (${b.nama})`,
              tanggal: waktuAfkir,
              createdAt: waktuAfkir,
            },
          });

          await prisma.barang.update({
            where: { id: b.id },
            data: {
              stok: sisaStokBaru,
              updatedAt: waktuAfkir,
            },
          });
        }
      }
    }

    // ------------------------------------------------------------------------
    // LOGIKA 2: RESTOK PASAR TERUKUR (HANYA BELI SAAT STOK MENIPIS)
    // ------------------------------------------------------------------------
    const isHariPasar = [1, 3, 5, 6].includes(dayOfWeek);

    const itemsToRestock: {
      barang: (typeof barangAktif)[0];
      qty: number;
    }[] = [];

    for (const b of barangAktif) {
      const prof = itemProfiles.get(b.id)!;
      const currentStok = globalStockTracker.get(b.id) || 0;

      // Restok hanya jika stok di bawah reorder point
      const butuhRestok =
        currentStok <= prof.reorderPoint && (isHariPasar || currentStok === 0);

      if (butuhRestok) {
        const qtyToBuy = getRandomInt(prof.restockQty[0], prof.restockQty[1]);
        itemsToRestock.push({ barang: b, qty: qtyToBuy });
      }
    }

    if (itemsToRestock.length > 0) {
      let totalHargaBeli = 0;
      const detailMasukData: any[] = [];
      const dbLotUpdates: any[] = [];

      const waktuMasuk = randomizeTime(currentDate, 5, 8);
      const lotIdStr = generateId('LOT', waktuMasuk, urutanLot++);
      const nomorLot = await prisma.nomorLot.create({
        data: { kode: lotIdStr, createdAt: waktuMasuk, updatedAt: waktuMasuk },
      });

      for (const item of itemsToRestock) {
        const b = item.barang;
        const qty = item.qty;
        const currentStok = globalStockTracker.get(b.id) || 0;
        const hargaBeli = Number(b.harga);

        totalHargaBeli += qty * hargaBeli;

        detailMasukData.push({
          barang_id: b.id,
          jumlah: qty,
          hargaSatuan: hargaBeli,
        });
        dbLotUpdates.push({
          nomorLot_id: nomorLot.id,
          barang_id: b.id,
          totalBarang: qty,
        });

        globalStockTracker.set(b.id, currentStok + qty);
        lotFifoQueue.get(b.id)!.push({
          lotId: nomorLot.id,
          qty: qty,
          tglMasuk: waktuMasuk,
        });
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

        const stockMovementsMasuk = detailMasukData.map((d) => {
          const currentStokNow = globalStockTracker.get(d.barang_id) || 0;
          return {
            barang_id: d.barang_id,
            nomorLot_id: nomorLot.id,
            tipe: 'IN' as const,
            jumlah: d.jumlah,
            stokSebelum: currentStokNow - d.jumlah,
            stokSesudah: currentStokNow,
            referensiId: trxMasukId,
            keterangan: `Penerimaan restok barang masuk (Lot: ${nomorLot.kode})`,
            tanggal: waktuMasuk,
            createdAt: waktuMasuk,
          };
        });
        await prisma.stockMovement.createMany({ data: stockMovementsMasuk });

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
    // LOGIKA 3: PERMINTAAN RESTORAN AKTIF
    // ------------------------------------------------------------------------
    const isWeekendPrep = dayOfWeek === 4 || dayOfWeek === 5;
    const multiplier = isWeekendPrep ? 1.25 : 1.0;

    for (const p of pelanggan) {
      if (Math.random() < 0.75) {
        const reqFast = getRandomItems(
          barangFastMoving,
          Math.min(barangFastMoving.length, getRandomInt(12, 20)),
        );

        const slowWithStock = barangSlowMoving.filter(
          (b) => (globalStockTracker.get(b.id) || 0) > 0,
        );
        const reqSlow = getRandomItems(
          slowWithStock.length >= 5 ? slowWithStock : barangSlowMoving,
          getRandomInt(4, 8),
        );

        const itemsRequested = [...reqFast, ...reqSlow];

        const waktuRequest = randomizeTime(currentDate, 19, 22);
        const reqId = generateId('PB', waktuRequest, urutanPermintaan++);

        const detailReqData = itemsRequested.map((b) => {
          const prof = itemProfiles.get(b.id)!;
          const baseQty = getRandomInt(
            prof.orderQtyRange[0],
            prof.orderQtyRange[1],
          );
          const qty = Math.max(1, Math.round(baseQty * multiplier));
          return {
            barang_id: b.id,
            jumlah: qty,
          };
        });

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

        const besok = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        queuePermintaan.push({
          permintaan_id: permintaan.id,
          details: detailReqData,
          tanggalKirim: randomizeTime(besok, 8, 13),
        });
      }
    }

    // ------------------------------------------------------------------------
    // LOGIKA 4: PENGIRIMAN PESANAN KELUAR DENGAN ALOKASI FIFO
    // ------------------------------------------------------------------------
    const pengirimanHariIni = queuePermintaan.filter(
      (q) => q.tanggalKirim.getUTCDate() === currentDate.getUTCDate(),
    );

    for (const kirim of pengirimanHariIni) {
      let totalHargaJual = 0;
      const detailKeluarData: any[] = [];
      const updateLotDbTasks: any[] = [];

      for (const d of kirim.details) {
        let remainingToFulfill = d.jumlah;
        const b = semuaBarangMaster.find((item) => item.id === d.barang_id);
        const hargaJual = Number((b as any)?.harga_jual || b?.harga || 0);

        const availableLots = lotFifoQueue.get(d.barang_id) || [];

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

        const stockMovementsKeluar = detailKeluarData.map((d) => {
          const currentStokNow = globalStockTracker.get(d.barang_id) || 0;
          return {
            barang_id: d.barang_id,
            nomorLot_id: d.nomorLot_id,
            tipe: 'OUT' as const,
            jumlah: -d.jumlah,
            stokSebelum: currentStokNow + d.jumlah,
            stokSesudah: currentStokNow,
            referensiId: trxKeluarId,
            keterangan: `Pengiriman pesanan pelanggan via FIFO (Ref: ${kirim.permintaan_id})`,
            tanggal: kirim.tanggalKirim,
            createdAt: kirim.tanggalKirim,
          };
        });
        await prisma.stockMovement.createMany({ data: stockMovementsKeluar });

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
      (q) => q.tanggalKirim.getUTCDate() !== currentDate.getUTCDate(),
    );
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  console.log('✅ SELESAI! Data simulasi seimbang berhasil digenerate.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
