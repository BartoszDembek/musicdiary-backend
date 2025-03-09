import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';


@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':id')
  async postReview(@Param('id') id: string,@Body("spotifyId") spotifyId ,@Body("text") text: string, @Body("types") types, @Body("rating") rating: number ) {
    try {
        const response = await this.reviewService.postReview(id, spotifyId, text, types, rating);
        return response;
      } catch (error) {
        console.error('Get user error:', error);
        throw error;
      }
  }

  @Get(':spotifyId')
  async getReviewsBySpotifyId(
    @Param('spotifyId') spotifyId: string,
    @Query('type') type: string
  ) {
    try {
      const response = await this.reviewService.getReviewsBySpotifyId(spotifyId, type);
      return response;
    } catch (error) {
      console.error('Get reviews error:', error);
      throw error;
    }
  }
}