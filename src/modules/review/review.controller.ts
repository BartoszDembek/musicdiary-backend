import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';


@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('comment')
  async addComment(
    @Body('reviewId') reviewId: string,
    @Body('userId') userId: string,
    @Body('text') text: string,
  ) {
    try {
      return await this.reviewService.addComment(reviewId, userId, text);
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  }

  @Get('comments/:reviewId')
  async getComments(@Param('reviewId') reviewId: string) {
    try {
      return await this.reviewService.getComments(reviewId);
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  }

  @Post(':id')
  async postReview(@Param('id') id: string,
  @Body("spotifyId") spotifyId ,
  @Body("text") text: string,
  @Body("types") types,
  @Body("rating") rating: number,
  @Body("artistName") artistName: string,
  @Body("itemName") itemName: string) {
    try {
        const response = await this.reviewService.postReview(id, spotifyId, text, types, rating, artistName, itemName);
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