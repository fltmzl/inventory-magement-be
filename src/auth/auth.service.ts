import { Injectable } from '@nestjs/common';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { PegawaiService } from 'src/pegawai/pegawai.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private pegawaiService: PegawaiService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.pegawaiService.findOneByEmail(email);

    if (!user) return null;

    const isPasswordMatch = await bcrypt.compare(password, user.data.password);

    if (isPasswordMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.data;
      return result;
    }
  }

  async login(user: AuthorizedUser) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, alamat, foto, telepon, ...payload } = user;

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
