import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ReviewService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ReviewService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'https://xejncmdvbgkpcmypsnwh.supabase.co';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlam5jbWR2YmdrcGNteXBzbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMTIxNzAsImV4cCI6MjA1MzU4ODE3MH0.zncqgGsHa1MWzmMDEUKbTPlaTX2MWtNNKqIZ1sGc7kY';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async postReview(user_id: string, spotify_id:string, text: string, types: string, rating: number): Promise<any> {
    try {
      const { data: review, error } = await this.supabase
        .from('reviews')
        .insert({
          spotify_id,  
          user_id,
          text,
          types,
          rating,
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