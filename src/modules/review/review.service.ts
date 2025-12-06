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

  async postReview(user_id: string, spotify_id:string, 
    text: string, types: string, rating: number, artist_name: string, item_name: string, image: string): Promise<any> {
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
          image,
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
        .select(`
          *,
          users:users(*),
          review_comments:review_comments(
            *,
            users:users(*)
          )
        `)
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

  async addComment(reviewId: string, userId: string, text: string): Promise<any> {
    try {
      const { data: comment, error } = await this.supabase
        .from('review_comments')
        .insert({
          review_id: reviewId,
          user_id: userId,
          text,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error adding comment:', error);
        throw error;
      }

      return comment;
    } catch (error) {
      this.logger.error('Error adding comment:', error);
      throw error;
    }
  }

  async getComments(reviewId: string): Promise<any> {
    try {
      const { data: comments, error } = await this.supabase
        .from('review_comments')
        .select(`*, users:users(*)`)
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error) {
        this.logger.error('Error fetching comments:', error);
        throw error;
      }

      return comments;
    } catch (error) {
      this.logger.error('Error fetching comments:', error);
      throw error;
    }
  }

  async getReviewScore(reviewId: string): Promise<{ upvotes: number; downvotes: number }> {
    try {
      const { data, error } = await this.supabase
        .from('review_score')
        .select('up_votes, down_votes')
        .eq('review_id', reviewId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const upvotes = data?.up_votes?.length || 0;
      const downvotes = data?.down_votes?.length || 0;

      return { upvotes, downvotes };
    } catch (error) {
      this.logger.error('Error getting review score:', error);
      throw error;
    }
  }

  async voteReview(userId: string, reviewId: string, type: 'up' | 'down'): Promise<any> {
    try {
      let { data: score, error } = await this.supabase
        .from('review_score')
        .select('*')
        .eq('review_id', reviewId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!score) {
        const { data: newScore, error: createError } = await this.supabase
          .from('review_score')
          .insert({ review_id: reviewId, up_votes: [], down_votes: [] })
          .select()
          .single();
        
        if (createError) throw createError;
        score = newScore;
      }

      let upVotes: string[] = score.up_votes || [];
      let downVotes: string[] = score.down_votes || [];

      if (type === 'up') {
        if (upVotes.includes(userId)) {
          upVotes = upVotes.filter(id => id !== userId);
        } else {
          upVotes.push(userId);
          downVotes = downVotes.filter(id => id !== userId);
        }
      } else {
        if (downVotes.includes(userId)) {
          downVotes = downVotes.filter(id => id !== userId);
        } else {
          downVotes.push(userId);
          upVotes = upVotes.filter(id => id !== userId);
        }
      }

      const { error: updateError } = await this.supabase
        .from('review_score')
        .update({ up_votes: upVotes, down_votes: downVotes })
        .eq('id', score.id);

      if (updateError) throw updateError;

      return { upvotes: upVotes.length, downvotes: downVotes.length };
    } catch (error) {
      this.logger.error('Error voting review:', error);
      throw error;
    }
  }
}