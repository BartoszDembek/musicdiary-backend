import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FavoritesService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'https://xejncmdvbgkpcmypsnwh.supabase.co';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlam5jbWR2YmdrcGNteXBzbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMTIxNzAsImV4cCI6MjA1MzU4ODE3MH0.zncqgGsHa1MWzmMDEUKbTPlaTX2MWtNNKqIZ1sGc7kY';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async addFavorite(user_id: string, id: string, artistName: string, albumName: string): Promise<any> {
    try {
      // First, get the current favorites record
      const { data: existingFavorite, error: fetchError } = await this.supabase
        .from('favorites')
        .select('favorite')
        .eq('user_id', user_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let updatedFavorite;
      if (existingFavorite) {
        // If record exists, add new id to the array
        const currentFavorite = existingFavorite.favorite || [];
        const isAlreadyFavorited = currentFavorite.some(favorite => 
          typeof favorite === 'object' ? favorite.id === id : favorite === id
        );
        
        if (!isAlreadyFavorited) {
          const favoriteObject = {
            id: id,
            artist_name: artistName,
            item_name: albumName,
            createdAt: new Date().toISOString()
          };
          updatedFavorite = [...currentFavorite, favoriteObject];
        } else {
          return { message: 'Artist already favorited' };
        }

        // Update existing record
        const { data, error } = await this.supabase
          .from('favorites')
          .update({ favorite: updatedFavorite })
          .eq('user_id', user_id)
          .select();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      this.logger.error('Error creating favorite:', error);
      throw error;
    }
  }

  async removeFavorite(user_id: string, id: string): Promise<any> {
    try {
      // Get the current favorites record
      const { data: existingFavorite, error: fetchError } = await this.supabase
        .from('favorites')
        .select('favorite')
        .eq('user_id', user_id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!existingFavorite || !existingFavorite.favorite) {
        return { message: 'User is not favoriting this artist' };
      }

      // Remove id from the array
      const updatedFavorite = existingFavorite.favorite.filter(favorite => {
        // Handle both old format (string) and new format (object)
        const favoriteId = typeof favorite === 'object' ? favorite.id : favorite;
        return favoriteId !== id;
      });

      // Update the record in database
      const { data, error } = await this.supabase
        .from('favorites')
        .update({ favorite: updatedFavorite })
        .eq('user_id', user_id)
        .select();

      if (error) throw error;
      return data;

    } catch (error) {
      this.logger.error('Error removing favorite artist:', error);
      throw error;
    }
  }
}