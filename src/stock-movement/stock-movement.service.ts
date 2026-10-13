import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MovementType, Prisma } from '@prisma/client';
import { timestampToISOString } from 'utils/time.util';
import {
  AdjustmentType,
  CreateStockAdjustmentDto,
} from './dto/create-stock-adjustment.dto';

export interface RecordStockMovementParams {
  barang_id: string;
  nomorLot_id?: string | null;
  tipe: MovementType;
  jumlah: number;
  stokSebelum: number;
  stokSesudah: number;
  referensiId?: string | null;
  keterangan?: string | null;
  tanggal?: Date;
}

@Injectable()
export class StockMovementService {
  constructor(private readonly prisma: PrismaService) {}

  async recordMovement(
    params: RecordStockMovementParams,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.stockMovement.create({
      data: {
        barang_id: params.barang_id,
        nomorLot_id: params.nomorLot_id || null,
        tipe: params.tipe,
        jumlah: params.jumlah,
        stokSebelum: params.stokSebelum,
        stokSesudah: params.stokSesudah,
        referensiId: params.referensiId || null,
        keterangan: params.keterangan || null,
        tanggal: params.tanggal || new Date(),
      },
    });
  }

  async recordManyMovements(
    items: RecordStockMovementParams[],
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.stockMovement.createMany({
      data: items.map((item) => ({
        barang_id: item.barang_id,
        nomorLot_id: item.nomorLot_id || null,
        tipe: item.tipe,
        jumlah: item.jumlah,
        stokSebelum: item.stokSebelum,
        stokSesudah: item.stokSesudah,
        referensiId: item.referensiId || null,
        keterangan: item.keterangan || null,
        tanggal: item.tanggal || new Date(),
      })),
    });
  }

  async findAll(params?: {
    dateFrom?: string | number;
    dateTo?: string | number;
    tipe?: MovementType;
    barangId?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) {
    const { dateFrom, dateTo, tipe, barangId, search, limit, page } =
      params || {};

    const whereCondition: Prisma.StockMovementWhereInput = {};

    if (dateFrom || dateTo) {
      whereCondition.tanggal = {};
      if (dateFrom) {
        whereCondition.tanggal.gte = timestampToISOString(Number(dateFrom));
      }
      if (dateTo) {
        whereCondition.tanggal.lte = timestampToISOString(Number(dateTo));
      }
    }

    if (tipe) {
      whereCondition.tipe = tipe;
    }

    if (barangId) {
      whereCondition.barang_id = barangId;
    }

    if (search) {
      whereCondition.OR = [
        { referensiId: { contains: search, mode: 'insensitive' } },
        { keterangan: { contains: search, mode: 'insensitive' } },
        { barang: { nama: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: whereCondition,
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              satuan: { select: { nama: true } },
              kategori: { select: { nama: true } },
            },
          },
          nomorLot: {
            select: {
              id: true,
              kode: true,
            },
          },
        },
        orderBy: [{ tanggal: 'desc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      this.prisma.stockMovement.count({ where: whereCondition }),
    ]);

    return {
      data,
      meta: {
        total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : total,
      },
    };
  }

  async findByBarang(
    barangId: string,
    params?: { dateFrom?: string | number; dateTo?: string | number },
  ) {
    return this.findAll({
      ...params,
      barangId,
    });
  }

  async getSummary(params?: {
    dateFrom?: string | number;
    dateTo?: string | number;
  }) {
    const { dateFrom, dateTo } = params || {};
    const whereCondition: Prisma.StockMovementWhereInput = {};

    if (dateFrom || dateTo) {
      whereCondition.tanggal = {};
      if (dateFrom) {
        whereCondition.tanggal.gte = timestampToISOString(Number(dateFrom));
      }
      if (dateTo) {
        whereCondition.tanggal.lte = timestampToISOString(Number(dateTo));
      }
    }

    const movements = await this.prisma.stockMovement.findMany({
      where: whereCondition,
      select: {
        tipe: true,
        jumlah: true,
      },
    });

    let totalIn = 0;
    let totalOut = 0;
    let totalAdjustment = 0;
    let totalInitial = 0;

    movements.forEach((m) => {
      if (m.tipe === MovementType.IN) totalIn += m.jumlah;
      if (m.tipe === MovementType.OUT) totalOut += Math.abs(m.jumlah);
      if (m.tipe === MovementType.ADJUSTMENT) totalAdjustment += m.jumlah;
      if (m.tipe === MovementType.INITIAL) totalInitial += m.jumlah;
    });

    return {
      data: {
        totalMovements: movements.length,
        totalIn,
        totalOut,
        totalAdjustment,
        totalInitial,
      },
    };
  }

  async getReport(params?: {
    dateFrom?: string | number;
    dateTo?: string | number;
    tipe?: MovementType;
    barangId?: string;
  }) {
    const { dateFrom, dateTo, tipe, barangId } = params || {};
    const whereCondition: Prisma.StockMovementWhereInput = {};

    if (dateFrom || dateTo) {
      whereCondition.tanggal = {};
      if (dateFrom) {
        whereCondition.tanggal.gte = timestampToISOString(Number(dateFrom));
      }
      if (dateTo) {
        whereCondition.tanggal.lte = timestampToISOString(Number(dateTo));
      }
    }

    if (tipe) {
      whereCondition.tipe = tipe;
    }

    if (barangId) {
      whereCondition.barang_id = barangId;
    }

    const [data, movementsSummary] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: whereCondition,
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              satuan: { select: { nama: true } },
              kategori: { select: { nama: true } },
            },
          },
          nomorLot: {
            select: {
              id: true,
              kode: true,
            },
          },
        },
        orderBy: [{ tanggal: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.stockMovement.findMany({
        where: whereCondition,
        select: {
          tipe: true,
          jumlah: true,
        },
      }),
    ]);

    let totalIn = 0;
    let totalOut = 0;
    let totalAdjustment = 0;
    let totalInitial = 0;

    movementsSummary.forEach((m) => {
      if (m.tipe === MovementType.IN) totalIn += m.jumlah;
      if (m.tipe === MovementType.OUT) totalOut += Math.abs(m.jumlah);
      if (m.tipe === MovementType.ADJUSTMENT) totalAdjustment += m.jumlah;
      if (m.tipe === MovementType.INITIAL) totalInitial += m.jumlah;
    });

    return {
      data,
      summary: {
        totalMovements: data.length,
        totalIn,
        totalOut,
        totalAdjustment,
        totalInitial,
        netChange: totalInitial + totalIn - totalOut + totalAdjustment,
      },
      meta: {
        totalItems: data.length,
      },
    };
  }

  async getWeeklySummary(params?: {
    month?: number | string;
    year?: number | string;
    from?: string | number;
    to?: string | number;
    barangId?: string;
  }) {
    let startDate: Date;
    let endDate: Date;
    let parsedMonth: number;
    let parsedYear: number;

    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    if (params?.from && params?.to) {
      startDate = new Date(
        typeof params.from === 'number' || !isNaN(Number(params.from))
          ? Number(params.from)
          : params.from,
      );
      endDate = new Date(
        typeof params.to === 'number' || !isNaN(Number(params.to))
          ? Number(params.to)
          : params.to,
      );
      parsedMonth = startDate.getUTCMonth() + 1;
      parsedYear = startDate.getUTCFullYear();
    } else {
      parsedYear = params?.year ? Number(params.year) : 2024;
      parsedMonth = params?.month ? Number(params.month) : 9;

      startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1, 0, 0, 0));
      const daysInMonth = new Date(
        Date.UTC(parsedYear, parsedMonth, 0),
      ).getUTCDate();
      endDate = new Date(
        Date.UTC(parsedYear, parsedMonth - 1, daysInMonth, 23, 59, 59, 999),
      );
    }

    const daysInMonth = new Date(
      Date.UTC(parsedYear, parsedMonth, 0),
    ).getUTCDate();
    const mName = monthNames[parsedMonth - 1] || 'Bulan';

    // Pembagian interval minggu berdasarkan baris kalender riil (Minggu s/d Sabtu)
    const weekRanges: {
      week: number;
      label: string;
      start: Date;
      end: Date;
    }[] = [];

    let currentStartDay = 1;
    let weekNum = 1;

    while (currentStartDay <= daysInMonth) {
      const curDate = new Date(
        Date.UTC(parsedYear, parsedMonth - 1, currentStartDay),
      );
      const dayOfWeek = curDate.getUTCDay(); // 0 = Minggu (Su), ..., 6 = Sabtu (Sa)
      const daysUntilSaturday = 6 - dayOfWeek;
      const currentEndDay = Math.min(
        currentStartDay + daysUntilSaturday,
        daysInMonth,
      );

      const wStart = new Date(
        Date.UTC(parsedYear, parsedMonth - 1, currentStartDay, 0, 0, 0),
      );
      const wEnd = new Date(
        Date.UTC(parsedYear, parsedMonth - 1, currentEndDay, 23, 59, 59, 999),
      );

      const sDayStr = String(currentStartDay).padStart(2, '0');
      const eDayStr = String(currentEndDay).padStart(2, '0');

      weekRanges.push({
        week: weekNum,
        label: `Minggu ${weekNum} (${sDayStr} - ${eDayStr} ${mName} ${parsedYear})`,
        start: wStart,
        end: wEnd,
      });

      currentStartDay = currentEndDay + 1;
      weekNum++;
    }

    const movements = await this.prisma.stockMovement.findMany({
      where: {
        tanggal: { gte: startDate, lte: endDate },
        ...(params?.barangId ? { barang_id: params.barangId } : {}),
      },
      include: {
        barang: {
          include: {
            kategori: { select: { nama: true } },
            satuan: { select: { nama: true } },
          },
        },
      },
      orderBy: { tanggal: 'asc' },
    });

    let overallMasuk = 0;
    let overallTerjual = 0;
    let overallSusut = 0;
    let overallNilaiSusutRp = 0;

    const weeksResult = weekRanges.map((w) => {
      const wMovements = movements.filter(
        (m) => m.tanggal >= w.start && m.tanggal <= w.end,
      );

      const itemMap = new Map<
        string,
        {
          barangId: string;
          nama: string;
          kategori: string;
          satuan: string;
          harga: number;
          stokMasuk: number;
          stokTerjual: number;
          stokSusut: number;
        }
      >();

      let wMasuk = 0;
      let wTerjual = 0;
      let wSusut = 0;
      let wNilaiSusut = 0;

      for (const m of wMovements) {
        if (!itemMap.has(m.barang_id)) {
          itemMap.set(m.barang_id, {
            barangId: m.barang_id,
            nama: m.barang.nama,
            kategori: m.barang.kategori?.nama || '-',
            satuan: m.barang.satuan?.nama || '-',
            harga: Number(m.barang.harga),
            stokMasuk: 0,
            stokTerjual: 0,
            stokSusut: 0,
          });
        }

        const item = itemMap.get(m.barang_id)!;
        if (m.tipe === MovementType.IN) {
          item.stokMasuk += m.jumlah;
          wMasuk += m.jumlah;
        } else if (m.tipe === MovementType.OUT) {
          const qty = Math.abs(m.jumlah);
          item.stokTerjual += qty;
          wTerjual += qty;
        } else if (m.tipe === MovementType.ADJUSTMENT) {
          const qty = Math.abs(m.jumlah);
          item.stokSusut += qty;
          wSusut += qty;
          wNilaiSusut += qty * item.harga;
        }
      }

      overallMasuk += wMasuk;
      overallTerjual += wTerjual;
      overallSusut += wSusut;
      overallNilaiSusutRp += wNilaiSusut;

      const items = Array.from(itemMap.values())
        .filter((i) => i.stokMasuk > 0 || i.stokTerjual > 0 || i.stokSusut > 0)
        .map((i) => {
          const totalKeluar = i.stokTerjual + i.stokSusut;
          const pctSusut =
            totalKeluar > 0
              ? Number(((i.stokSusut / totalKeluar) * 100).toFixed(1))
              : 0;
          return {
            ...i,
            persentaseSusut: pctSusut,
            nilaiSusutRp: i.stokSusut * i.harga,
          };
        })
        .sort((a, b) => b.stokMasuk - a.stokMasuk);

      const totalProcessed = wTerjual + wSusut;
      return {
        week: w.week,
        label: w.label,
        startDate: w.start.toISOString(),
        endDate: w.end.toISOString(),
        summary: {
          totalMasuk: wMasuk,
          totalTerjual: wTerjual,
          totalSusut: wSusut,
          persentaseTerjual:
            totalProcessed > 0
              ? Number(((wTerjual / totalProcessed) * 100).toFixed(1))
              : 0,
          persentaseSusut:
            totalProcessed > 0
              ? Number(((wSusut / totalProcessed) * 100).toFixed(1))
              : 0,
          totalNilaiSusutRp: wNilaiSusut,
        },
        items,
      };
    });

    const overallProcessed = overallTerjual + overallSusut;
    return {
      data: {
        period: {
          month: parsedMonth,
          monthName: mName,
          year: parsedYear,
          from: startDate.toISOString(),
          to: endDate.toISOString(),
        },
        overall: {
          totalMasuk: overallMasuk,
          totalTerjual: overallTerjual,
          totalSusut: overallSusut,
          persentaseTerjual:
            overallProcessed > 0
              ? Number(((overallTerjual / overallProcessed) * 100).toFixed(1))
              : 0,
          persentaseSusut:
            overallProcessed > 0
              ? Number(((overallSusut / overallProcessed) * 100).toFixed(1))
              : 0,
          totalNilaiSusutRp: overallNilaiSusutRp,
        },
        weeks: weeksResult,
      },
    };
  }

  async createAdjustment(dto: CreateStockAdjustmentDto) {
    const cleanLotId = dto.nomorLotId?.trim() || null;
    const tanggal = dto.tanggal ? new Date(dto.tanggal) : new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. Validasi keberadaan barang
      const barang = await tx.barang.findUnique({
        where: { id: dto.barangId },
        include: { satuan: true },
      });

      if (!barang) {
        throw new NotFoundException(
          `Barang dengan ID '${dto.barangId}' tidak ditemukan`,
        );
      }

      // 2. Generate referensi ID unik untuk transaksi adjustment
      const date2Digit = tanggal.getDate().toString().padStart(2, '0');
      const month2Digit = (tanggal.getMonth() + 1).toString().padStart(2, '0');
      const year2Digit = tanggal.getFullYear().toString().slice(-2);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referensiId = `ADJ${date2Digit}${month2Digit}${year2Digit}${randomSuffix}`;

      const affectedLots: Array<{
        nomorLotId: string | null;
        kode: string;
        jumlah: number;
        stokLotAkhir?: number;
      }> = [];

      let newTotalStok = barang.stok;

      if (dto.jenis === AdjustmentType.KURANG) {
        // Cek kecukupan stok total barang
        if (barang.stok < dto.jumlah) {
          throw new BadRequestException(
            `Stok barang tidak mencukupi untuk dikurangi. Stok saat ini: ${barang.stok}, pengurangan yang diminta: ${dto.jumlah}`,
          );
        }

        if (cleanLotId) {
          // A. Pengurangan dengan Nomor Lot spesifik yang diinput
          const targetLot = await tx.nomorLot.findFirst({
            where: {
              OR: [{ id: cleanLotId }, { kode: cleanLotId }],
            },
          });

          if (!targetLot) {
            throw new NotFoundException(
              `Nomor Lot '${cleanLotId}' tidak ditemukan`,
            );
          }

          const lotDetail = await tx.detailNomorLotBarang.findUnique({
            where: {
              nomorLot_id_barang_id: {
                nomorLot_id: targetLot.id,
                barang_id: dto.barangId,
              },
            },
          });

          const currentLotStock = lotDetail?.totalBarang || 0;
          if (currentLotStock < dto.jumlah) {
            throw new BadRequestException(
              `Stok pada Lot ${targetLot.kode} tidak mencukupi (Tersedia: ${currentLotStock}, Diminta: ${dto.jumlah})`,
            );
          }

          await tx.detailNomorLotBarang.update({
            where: {
              nomorLot_id_barang_id: {
                nomorLot_id: targetLot.id,
                barang_id: dto.barangId,
              },
            },
            data: {
              totalBarang: currentLotStock - dto.jumlah,
            },
          });

          await tx.stockMovement.create({
            data: {
              barang_id: dto.barangId,
              nomorLot_id: targetLot.id,
              tipe: MovementType.ADJUSTMENT,
              jumlah: -dto.jumlah,
              stokSebelum: barang.stok,
              stokSesudah: barang.stok - dto.jumlah,
              referensiId,
              keterangan: `Penyesuaian stok berkurang (Lot: ${targetLot.kode}) - Alasan: ${dto.alasan}`,
              tanggal,
            },
          });

          affectedLots.push({
            nomorLotId: targetLot.id,
            kode: targetLot.kode,
            jumlah: -dto.jumlah,
            stokLotAkhir: currentLotStock - dto.jumlah,
          });
        } else {
          // B. Pengurangan tanpa input Nomor Lot: otomatis potong via FIFO (lot tertua lebih dulu)
          const availableLots = await tx.detailNomorLotBarang.findMany({
            where: {
              barang_id: dto.barangId,
              totalBarang: { gt: 0 },
            },
            include: { nomorLot: true },
            orderBy: {
              nomorLot: { createdAt: 'asc' },
            },
          });

          let remainingQty = dto.jumlah;
          let runningStock = barang.stok;

          for (const lot of availableLots) {
            if (remainingQty <= 0) break;
            const lotStock = lot.totalBarang || 0;
            const deductQty = Math.min(remainingQty, lotStock);

            await tx.detailNomorLotBarang.update({
              where: {
                nomorLot_id_barang_id: {
                  nomorLot_id: lot.nomorLot_id,
                  barang_id: dto.barangId,
                },
              },
              data: {
                totalBarang: lotStock - deductQty,
              },
            });

            await tx.stockMovement.create({
              data: {
                barang_id: dto.barangId,
                nomorLot_id: lot.nomorLot_id,
                tipe: MovementType.ADJUSTMENT,
                jumlah: -deductQty,
                stokSebelum: runningStock,
                stokSesudah: runningStock - deductQty,
                referensiId,
                keterangan: `Penyesuaian stok berkurang (FIFO Lot: ${lot.nomorLot.kode}) - Alasan: ${dto.alasan}`,
                tanggal,
              },
            });

            affectedLots.push({
              nomorLotId: lot.nomorLot_id,
              kode: lot.nomorLot.kode,
              jumlah: -deductQty,
              stokLotAkhir: lotStock - deductQty,
            });

            runningStock -= deductQty;
            remainingQty -= deductQty;
          }

          // Jika ada sisa kuantitas (misal stok awal sebelum sistem lot diterapkan)
          if (remainingQty > 0) {
            await tx.stockMovement.create({
              data: {
                barang_id: dto.barangId,
                nomorLot_id: null,
                tipe: MovementType.ADJUSTMENT,
                jumlah: -remainingQty,
                stokSebelum: runningStock,
                stokSesudah: runningStock - remainingQty,
                referensiId,
                keterangan: `Penyesuaian stok berkurang (Tanpa Lot) - Alasan: ${dto.alasan}`,
                tanggal,
              },
            });

            affectedLots.push({
              nomorLotId: null,
              kode: 'NON-LOT',
              jumlah: -remainingQty,
              stokLotAkhir: 0,
            });
          }
        }

        newTotalStok = barang.stok - dto.jumlah;
      } else {
        // jenis === AdjustmentType.TAMBAH
        if (cleanLotId) {
          // A. Penambahan ke Lot yang diinput
          const targetLot = await tx.nomorLot.findFirst({
            where: {
              OR: [{ id: cleanLotId }, { kode: cleanLotId }],
            },
          });

          if (!targetLot) {
            throw new NotFoundException(
              `Nomor Lot '${cleanLotId}' tidak ditemukan`,
            );
          }

          const existingDetail = await tx.detailNomorLotBarang.findUnique({
            where: {
              nomorLot_id_barang_id: {
                nomorLot_id: targetLot.id,
                barang_id: dto.barangId,
              },
            },
          });

          const currentLotStock = existingDetail?.totalBarang || 0;
          const updatedLotStock = currentLotStock + dto.jumlah;

          if (existingDetail) {
            await tx.detailNomorLotBarang.update({
              where: {
                nomorLot_id_barang_id: {
                  nomorLot_id: targetLot.id,
                  barang_id: dto.barangId,
                },
              },
              data: {
                totalBarang: updatedLotStock,
              },
            });
          } else {
            await tx.detailNomorLotBarang.create({
              data: {
                nomorLot_id: targetLot.id,
                barang_id: dto.barangId,
                totalBarang: dto.jumlah,
              },
            });
          }

          await tx.stockMovement.create({
            data: {
              barang_id: dto.barangId,
              nomorLot_id: targetLot.id,
              tipe: MovementType.ADJUSTMENT,
              jumlah: dto.jumlah,
              stokSebelum: barang.stok,
              stokSesudah: barang.stok + dto.jumlah,
              referensiId,
              keterangan: `Penyesuaian stok bertambah (Lot: ${targetLot.kode}) - Alasan: ${dto.alasan}`,
              tanggal,
            },
          });

          affectedLots.push({
            nomorLotId: targetLot.id,
            kode: targetLot.kode,
            jumlah: dto.jumlah,
            stokLotAkhir: updatedLotStock,
          });
        } else {
          // B. Penambahan tanpa input Nomor Lot: otomatis buat Nomor Lot baru
          const startOfDay = new Date(
            tanggal.getFullYear(),
            tanggal.getMonth(),
            tanggal.getDate(),
          );
          const endOfDay = new Date(
            tanggal.getFullYear(),
            tanggal.getMonth(),
            tanggal.getDate() + 1,
          );

          const lotCount = await tx.nomorLot.count({
            where: {
              createdAt: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
          });

          const countedLotNumber = (lotCount + 1).toString().padStart(3, '0');
          let newKode = `LOT${date2Digit}${month2Digit}${year2Digit}${countedLotNumber}`;

          const existingKode = await tx.nomorLot.findUnique({
            where: { kode: newKode },
          });
          if (existingKode) {
            newKode = `LOT${date2Digit}${month2Digit}${year2Digit}${Date.now().toString().slice(-4)}`;
          }

          const newLot = await tx.nomorLot.create({
            data: {
              kode: newKode,
              createdAt: tanggal,
              barang: {
                create: {
                  barang_id: dto.barangId,
                  totalBarang: dto.jumlah,
                },
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              barang_id: dto.barangId,
              nomorLot_id: newLot.id,
              tipe: MovementType.ADJUSTMENT,
              jumlah: dto.jumlah,
              stokSebelum: barang.stok,
              stokSesudah: barang.stok + dto.jumlah,
              referensiId,
              keterangan: `Penyesuaian stok bertambah (Lot Baru: ${newLot.kode}) - Alasan: ${dto.alasan}`,
              tanggal,
            },
          });

          affectedLots.push({
            nomorLotId: newLot.id,
            kode: newLot.kode,
            jumlah: dto.jumlah,
            stokLotAkhir: dto.jumlah,
          });
        }

        newTotalStok = barang.stok + dto.jumlah;
      }

      // 3. Update stok master barang
      await tx.barang.update({
        where: { id: dto.barangId },
        data: {
          stok: newTotalStok,
        },
      });

      return {
        status: 'success',
        message: `Penyesuaian stok (${dto.jenis}) berhasil diproses`,
        data: {
          referensiId,
          barang: {
            id: barang.id,
            nama: barang.nama,
            satuan: barang.satuan?.nama || '',
          },
          jenis: dto.jenis,
          jumlah: dto.jumlah,
          stokSebelum: barang.stok,
          stokSesudah: newTotalStok,
          alasan: dto.alasan,
          affectedLots,
          tanggal: tanggal.toISOString(),
        },
      };
    });
  }
}
