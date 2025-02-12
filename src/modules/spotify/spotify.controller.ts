import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param } from '@nestjs/common';
import { SpotifyService } from './spotify.service';


@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('newReleases')
  async newReleases() {
    return await this.spotifyService.getNewReleases();
  }

}