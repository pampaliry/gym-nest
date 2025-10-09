import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

// 🧩 Prisma modul – pripojenie k databáze
import { PrismaModule } from './prisma/prisma.module';

// 🧩 Aplikácie (feature moduly)
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

// 🧩 Základné komponenty aplikácie
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 🧱 PrismaModule – centrálna databázová služba
    // exportuje PrismaService, ktorý môžu používať iné moduly (User, Auth)
    PrismaModule,

    // 👤 UserModule – práca s používateľmi (CRUD, profil, role)
    UserModule,

    // 🔐 AuthModule – login, registrácia, tokeny
    AuthModule,

    // 🛡️ ThrottlerModule – ochrana proti brute-force a DDoS útokom
    // limituje počet requestov na IP / časové obdobie
    ThrottlerModule.forRoot([
      {
        ttl: 60, // čas v sekundách (napr. 60 = 1 minúta)
        limit: 30, // max. 30 requestov za 60 sekúnd
      },
    ]),
  ],

  // 🌐 Hlavný kontrolér aplikácie (napr. GET /healthcheck)
  controllers: [AppController],

  // 🧠 Hlavná logika (AppService – bežne len testovací príklad)
  providers: [AppService],
})
export class AppModule {}
