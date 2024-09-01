import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PegawaiModule } from './pegawai/pegawai.module';
import { PelangganModule } from './pelanggan/pelanggan.module';
import { KategoriModule } from './kategori/kategori.module';
import { SatuanModule } from './satuan/satuan.module';
import { BarangModule } from './barang/barang.module';
import { TransaksiBarangMasukModule } from './transaksi-barang-masuk/transaksi-barang-masuk.module';
import { PermintaanBarangModule } from './permintaan-barang/permintaan-barang.module';
import { TransaksiBarangKeluarModule } from './transaksi-barang-keluar/transaksi-barang-keluar.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { constant } from './constant';
// import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    PegawaiModule,
    PelangganModule,
    KategoriModule,
    SatuanModule,
    BarangModule,
    TransaksiBarangMasukModule,
    PermintaanBarangModule,
    TransaksiBarangKeluarModule,
    AuthModule,
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: constant.MAIL.HOST,
        secure: false,
        auth: {
          user: constant.MAIL.USER,
          pass: constant.MAIL.PASSWORD,
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      // template: {
      //   dir: __dirname + '/templates',
      //   adapter: new EjsAdapter(),
      //   options: {
      //     strict: true,
      //   },
      // },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
