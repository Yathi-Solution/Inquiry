import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma-services/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable in production
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload); // Log the extracted payload

    const user = await this.prisma.users.findUnique({
      where: { user_id: payload.sub },
      include: { roles: true },
    });

    console.log('User fetched from DB:', user); // Log the fetched user

    return user; // This user object should include role_id
  }
}