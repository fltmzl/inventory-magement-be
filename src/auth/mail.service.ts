import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { constant } from 'src/constant';

export interface LowStockItem {
  id?: string;
  kode?: string;
  nama?: string;
  stok?: number;
  harga?: number;
  harga_jual?: number;
  pembelianTerakhir?: string | Date;
  kategori?: string;
  satuan?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  public async sendStockAlertEmail(
    items: LowStockItem[] = [],
    toEmail: string = 'fltmzl2810@gmail.com',
  ): Promise<void> {
    const isCritical = items.length > 0;
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Jakarta',
    }).format(now);

    const subject = isCritical
      ? `[Peringatan Stok] ${items.length} Barang Mencapai Batas Minimum`
      : `[Laporan Inventaris] Seluruh Stok Barang Aman`;

    const htmlContent = this.generateEmailTemplate(items, formattedDate);

    try {
      await this.mailerService.sendMail({
        from: `"Inventory System" <${constant.MAIL.USER || 'noreply@gmail.com'}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      this.logger.log(`Email notifikasi stok berhasil dikirim ke ${toEmail}`);
    } catch (error) {
      this.logger.error(
        `Gagal mengirim email ke ${toEmail}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  public async sendEmail(items: LowStockItem[] = []): Promise<void> {
    await this.sendStockAlertEmail(items);
  }

  private generateEmailTemplate(
    items: LowStockItem[],
    formattedDate: string,
  ): string {
    const isCritical = items.length > 0;
    const frontendUrl = constant.FRONTEND_URL;

    const formatRupiah = (num?: number) => {
      if (num === undefined || num === null || isNaN(Number(num))) return '-';
      return 'Rp ' + Number(num).toLocaleString('id-ID');
    };

    const formatTanggal = (dateVal?: string | Date) => {
      if (!dateVal) return '-';
      try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '-';
        return new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(d);
      } catch {
        return '-';
      }
    };

    const rowsHtml = items
      .map((item, index) => {
        const itemKode = item.id || item.kode || '-';
        const satuan = item.satuan || 'Unit';
        const isOutOfStock = (item.stok ?? 0) <= 0;
        const badgeBg = isOutOfStock ? '#fee2e2' : '#fef3c7';
        const badgeColor = isOutOfStock ? '#991b1b' : '#92400e';
        const badgeBorder = isOutOfStock ? '#fca5a5' : '#fcd34d';
        const statusText = isOutOfStock
          ? `Habis (0 ${satuan})`
          : `Kritis: ${item.stok} ${satuan}`;

        const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';

        return `
          <tr style="background-color: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 8px; font-size: 12px; color: #64748b; text-align: center; vertical-align: middle;">${index + 1}</td>
            <td style="padding: 12px 12px; font-size: 13px; font-weight: bold; color: #0f172a; vertical-align: middle;">
              <div>${item.nama || '-'}</div>
              <div style="font-size: 11px; font-weight: normal; color: #64748b; margin-top: 3px;">
                Kode: <code style="background-color: #f1f5f9; padding: 1px 4px; border-radius: 3px; color: #0f172a;">${itemKode}</code>
              </div>
            </td>
            <td style="padding: 12px 10px; font-size: 12px; color: #334155; vertical-align: middle;">
              <span style="background-color: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-size: 11px;">
                ${item.kategori || '-'}
              </span>
            </td>
            <td style="padding: 12px 10px; font-size: 12px; text-align: center; vertical-align: middle; white-space: nowrap;">
              <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px;">
                ${statusText}
              </span>
            </td>
            <td style="padding: 12px 12px; font-size: 12px; text-align: right; vertical-align: middle; white-space: nowrap;">
              <div style="font-weight: bold; color: #0f172a;">${formatRupiah(item.harga)}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Jual: ${formatRupiah(item.harga_jual)}</div>
            </td>
            <td style="padding: 12px 10px; font-size: 12px; color: #475569; text-align: center; vertical-align: middle; white-space: nowrap;">
              ${formatTanggal(item.pembelianTerakhir)}
            </td>
          </tr>
        `;
      })
      .join('');

    const actionButtonHtml = frontendUrl
      ? `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px; text-align: center;">
          <tr>
            <td align="center">
              <a href="${frontendUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; font-weight: bold;">
                Akses Dashboard Inventaris
              </a>
            </td>
          </tr>
        </table>
      `
      : '';

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notifikasi Stok Inventaris</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, Helvetica, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 720px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; text-align: left; border-bottom: 3px solid ${isCritical ? '#dc2626' : '#16a34a'};">
              <div style="color: #94a3b8; font-size: 11px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">
                Sistem Manajemen Inventaris
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: bold;">
                ${isCritical ? 'Peringatan: Stok Barang Menipis' : 'Laporan Status: Stok Barang Aman'}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 28px;">
              
              <!-- Status Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-radius: 6px; border: 1px solid ${isCritical ? '#fecaca' : '#bbf7d0'}; background-color: ${isCritical ? '#fef2f2' : '#f0fdf4'};">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 14px; font-weight: bold; color: ${isCritical ? '#991b1b' : '#166534'}; margin-bottom: 4px;">
                      ${isCritical ? 'Status: Perlu Tindak Lanjut' : 'Status: Normal'}
                    </div>
                    <div style="font-size: 13px; color: ${isCritical ? '#7f1d1d' : '#14532d'}; line-height: 1.5;">
                      ${
                        isCritical
                          ? `Terdapat ${items.length} item barang yang telah mencapai batas minimum stok (&le; 3 unit). Harap segera memeriksa persediaan barang dan melakukan pengadaan stok.`
                          : 'Seluruh stok barang saat ini berada dalam kondisi aman dan di atas batas minimum.'
                      }
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Metadata Summary -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #475569;">
                    <strong>Waktu Pengecekan:</strong> ${formattedDate}
                  </td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #475569; text-align: right;">
                    <strong>Batas Ambang:</strong> &le; 3 Unit
                  </td>
                </tr>
              </table>

              ${
                isCritical
                  ? `
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 14px; font-weight: bold; color: #0f172a;">
                    Daftar Barang Kritis (${items.length} Item)
                  </span>
                </div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; width: 100%;">
                  <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                      <th style="padding: 10px 8px; font-size: 11px; font-weight: bold; color: #475569; text-align: center; width: 30px;">No</th>
                      <th style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #475569; text-align: left;">Barang &amp; Kode</th>
                      <th style="padding: 10px 10px; font-size: 11px; font-weight: bold; color: #475569; text-align: left;">Kategori</th>
                      <th style="padding: 10px 10px; font-size: 11px; font-weight: bold; color: #475569; text-align: center;">Sisa Stok</th>
                      <th style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #475569; text-align: right;">Harga (Beli / Jual)</th>
                      <th style="padding: 10px 10px; font-size: 11px; font-weight: bold; color: #475569; text-align: center;">Pembelian Terakhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>
              `
                  : ''
              }

              ${actionButtonHtml}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b;">
                Email pemberitahuan ini dikirimkan secara otomatis oleh modul pengecekan stok berkala.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Inventory Management System.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
