import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SpotifyModule } from './modules/spotify/spotify.module';
import { UserModule } from './modules/user/user.module';
import { ReviewModule } from './modules/review/review.module';
import { FollowsModule } from './modules/follows/follows.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    SpotifyModule,
    UserModule,
    ReviewModule,
    FollowsModule,
    FavoritesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
