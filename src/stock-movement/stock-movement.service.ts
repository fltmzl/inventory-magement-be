import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MovementType, Prisma } from '@prisma/client';
import { timestampToISOString } from 'utils/time.util';

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
}
