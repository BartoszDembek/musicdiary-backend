import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param, NotFoundException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';


@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('add/:userId')
  async addFavorite(
    @Param('userId') userId: string, 
    @Query('id') id: string,
    @Body() body: { artistName: string; albumName: string, type: string, image:string }
  ) {
    try {
        const response = await this.favoritesService.addFavorite(userId, id, body.artistName, body.albumName, body.type, body.image);
        return response;
      } catch (error) {
        console.error('Get user error:', error);
        throw error;
      }
  }

  @Post('remove/:userId')
  async removeFavorite(@Param('userId') userId: string, @Query('id') id: string) {
    try {
        const response = await this.favoritesService.removeFavorite(userId, id);
        return response;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
  }
}