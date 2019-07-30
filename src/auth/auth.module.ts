import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LocalStrategy } from "./local.strategy"
import { UsersModule } from "src/users/users.module"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { jwtConstants } from "./constants"
import { JwtStrategy } from "./jwt.strategy"
import { AuthController } from "./auth.controller"

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "5h" }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
