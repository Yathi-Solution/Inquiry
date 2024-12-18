import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma-services/prisma.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
    ActivityLogsModule
  ],
  providers: [JwtStrategy, AuthService, AuthResolver],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}