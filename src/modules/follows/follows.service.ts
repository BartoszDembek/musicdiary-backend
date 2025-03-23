import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FollowsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(FollowsService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'https://xejncmdvbgkpcmypsnwh.supabase.co';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlam5jbWR2YmdrcGNteXBzbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMTIxNzAsImV4cCI6MjA1MzU4ODE3MH0.zncqgGsHa1MWzmMDEUKbTPlaTX2MWtNNKqIZ1sGc7kY';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async followArtist(user_id: string, artist_id: string): Promise<any> {
    try {
      // First, get the current follows record
      const { data: existingFollow, error: fetchError } = await this.supabase
        .from('follows')
        .select('follow')
        .eq('user_id', user_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let updatedFollow;
      if (existingFollow) {
        // If record exists, add new artist_id to the array
        const currentFollow = existingFollow.follow || [];
        if (!currentFollow.includes(artist_id)) {
          updatedFollow = [...currentFollow, artist_id];
        } else {
          return { message: 'Artist already followed' };
        }

        // Update existing record
        const { data, error } = await this.supabase
          .from('follows')
          .update({ follow: updatedFollow })
          .eq('user_id', user_id)
          .select();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      this.logger.error('Error creating follow:', error);
      throw error;
    }
  }

  async unfollowArtist(user_id: string, artist_id: string): Promise<any> {
    try {
      // Get the current follows record
      const { data: existingFollow, error: fetchError } = await this.supabase
        .from('follows')
        .select('follow')
        .eq('user_id', user_id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!existingFollow || !existingFollow.follow) {
        return { message: 'User is not following this artist' };
      }

      // Remove artist_id from the array
      const updatedFollow = existingFollow.follow.filter(id => id !== artist_id);

      // Update the record in database
      const { data, error } = await this.supabase
        .from('follows')
        .update({ follow: updatedFollow })
        .eq('user_id', user_id)
        .select();

      if (error) throw error;
      return data;

    } catch (error) {
      this.logger.error('Error unfollowing artist:', error);
      throw error;
    }
  }
}