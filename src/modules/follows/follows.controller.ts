import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param, NotFoundException } from '@nestjs/common';
import { FollowsService } from './follows.service';


@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follow-artist/:id')
  async getFollows(
    @Param('id') id: string, 
    @Query('artistId') artist_id: string,
    @Body() body: { artistName: string }
  ) {
    try {
        const response = await this.followsService.followArtist(id, artist_id, body.artistName);
        return response;
      } catch (error) {
        console.error('Get user error:', error);
        throw error;
      }
  }

  @Post('unfollow-artist/:id')
  async getUnfollows(@Param('id') id: string, @Query('artistId') artist_id: string) {
    try {
        const response = await this.followsService.unfollowArtist(id, artist_id);
        return response;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
  }
}