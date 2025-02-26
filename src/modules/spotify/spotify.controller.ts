import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param } from '@nestjs/common';
import { SpotifyService } from './spotify.service';


@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('newReleases')
  async newReleases() {
    return await this.spotifyService.getNewReleases();
  }

  @Get('album/:id')
  async getAlbumByIDs(@Param('id') id: string) {
    return await this.spotifyService.getAlbumByID(id);
  }

  @Get('artist/:id')
  async getArtistByID(@Param('id') id: string) {
    return await this.spotifyService.getArtistByID(id);
  }

  @Get('artist/:id/albums')
  async getArtistAlbums(@Param('id') id: string) {
    return await this.spotifyService.getArtistAlbums(id);
  }

  @Get('artist/:id/top-tracks')
  async getArtistTopTracks(@Param('id') id: string) {
    return await this.spotifyService.getArtistTopTracks(id);
  }

  @Get('search')
  async search(@Query('query') query: string) {
    return await this.spotifyService.search(query);
  }
}