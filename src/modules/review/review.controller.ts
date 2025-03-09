import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';


@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':id')
  async postReview(@Param('id') id: string, @Body() text: string, @Body() types, @Body() rating: number ) {
    try {
        const response = await this.reviewService.postReview(id, text, types, rating);
        return response;
      } catch (error) {
        console.error('Get user error:', error);
        throw error;
      }
  }
}