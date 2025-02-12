import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SpotifyModule } from './modules/spotify/spotify.module';

@Module({
  imports: [
    AuthModule,
    SpotifyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
