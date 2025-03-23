import { Module } from '@nestjs/common';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService]
})
export class FollowsModule {}