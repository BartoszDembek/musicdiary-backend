import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ReviewService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ReviewService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async postReview(user_id: string, spotify_id:string, text: string, types: string, rating: number, artist_name: string, item_name: string): Promise<any> {
    try {
      const { data: review, error } = await this.supabase
        .from('reviews')
        .insert({
          spotify_id,
          user_id,
          text,
          types,
          rating,
          artist_name,
          item_name,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating review:', error);
        throw error;
      }

      return review;
    } catch (error) {
      this.logger.error('Error creating review:', error);
      throw error;
    }
  }

  async getReviewsBySpotifyId(spotify_id: string, type: string): Promise<any> {
    try {
      const { data: reviews, error } = await this.supabase
        .from('reviews')
        .select('*')
        .eq('spotify_id', spotify_id)
        .eq('types', type);

      if (error) {
        this.logger.error('Error fetching reviews:', error);
        throw error;
      }

      return reviews;
    } catch (error) {
      this.logger.error('Error fetching reviews:', error);
      throw error;
    }
  }
}