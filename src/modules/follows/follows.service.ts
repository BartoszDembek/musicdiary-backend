import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FollowsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(FollowsService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')?.toString();
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY')?.toString();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async followArtist(user_id: string, artist_id: string, artistName: string): Promise<any> {
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
        const isAlreadyFollowed = currentFollow.some(follow => 
          typeof follow === 'object' ? follow.id === artist_id : follow === artist_id
        );
        
        if (!isAlreadyFollowed) {
          const followObject = {
            id: artist_id,
            artist_name: artistName,
            createdAt: new Date().toISOString()
          };
          updatedFollow = [...currentFollow, followObject];
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
      const updatedFollow = existingFollow.follow.filter(follow => {
        // Handle both old format (string) and new format (object)
        const followId = typeof follow === 'object' ? follow.id : follow;
        return followId !== artist_id;
      });

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

  async followUser(user_id: string, targetUserId: string, targetUserName: string): Promise<any> {
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
        // If record exists, add new user_id to the array
        const currentFollow = existingFollow.follow || [];
        const isAlreadyFollowed = currentFollow.some(follow => 
          typeof follow === 'object' ? follow.id === targetUserId : follow === targetUserId
        );
        
        if (!isAlreadyFollowed) {
          const followObject = {
            id: targetUserId,
            user_name: targetUserName,
            createdAt: new Date().toISOString()
          };
          updatedFollow = [...currentFollow, followObject];
        } else {
          return { message: 'User already followed' };
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

  async unfollowUser(user_id: string, targetUserId: string): Promise<any> {
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
        return { message: 'User is not following this user' };
      }

      // Remove user_id from the array
      const updatedFollow = existingFollow.follow.filter(follow => {
        // Handle both old format (string) and new format (object)
        const followId = typeof follow === 'object' ? follow.id : follow;
        return followId !== targetUserId;
      });

      // Update the record in database
      const { data, error } = await this.supabase
        .from('follows')
        .update({ follow: updatedFollow })
        .eq('user_id', user_id)
        .select();

      if (error) throw error;
      return data;

    } catch (error) {
      this.logger.error('Error unfollowing user:', error);
      throw error;
    }
  }
}