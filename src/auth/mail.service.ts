import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public sendEmail(): void {
    const emailHtml = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
  
          .verif {
            background-color: #0c95f7
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hello, World!</h1>
          <p>This is a sample email with CSS styling.</p>
          <button class="verif">Verifikasi email</button>
        </div>
      </body>
    </html>
  `;

    this.mailerService
      .sendMail({
        from: 'noreply@gmail.com',
        to: 'fltmzl2810@gmail.com',
        subject: 'Mengirim Email',
        html: emailHtml,
      })
      .then(() => {
        console.log('Email berhasil terkirim');
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
