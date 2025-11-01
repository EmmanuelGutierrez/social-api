import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { config, configType } from 'src/common/config/config';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  imports: [
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: '15m' },
    // }),
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configService: configType) => {
        return {
          secret: configService.api.jwtSecret,
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
    UserModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
