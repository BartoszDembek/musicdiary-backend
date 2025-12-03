import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ListService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ListService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createList(userId: string, title: string, description: string, isPublic: boolean) {
    const { data, error } = await this.supabase
      .from('lists')
      .insert({
        user_id: userId,
        title,
        description,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating list:', error);
      throw error;
    }
    return data;
  }

  async getUserLists(userId: string) {
    const { data, error } = await this.supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching user lists:', error);
      throw error;
    }
    return data;
  }

  async searchLists(query: string) {
    const { data, error } = await this.supabase
      .from('lists')
      .select('*')
      .ilike('title', `%${query}%`)
      .eq('is_public', true)
      .limit(20);

    if (error) {
      this.logger.error('Error searching lists:', error);
      throw error;
    }
    return data;
  }

  async getListDetails(listId: string) {
    const { data, error } = await this.supabase
      .from('lists')
      .select(`
        *,
        list_items (*)
      `)
      .eq('id', listId)
      .single();

    if (error) {
      this.logger.error('Error fetching list details:', error);
      throw error;
    }
    return data;
  }

  async addListItem(listId: string, item: any) {
    const { data, error } = await this.supabase
      .from('list_items')
      .insert({
        list_id: listId,
        ...item
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding list item:', error);
      throw error;
    }
    return data;
  }

  async removeListItem(listId: string, itemId: string) {
    const { data, error } = await this.supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      .eq('list_id', listId)
      .select();

    if (error) {
      this.logger.error('Error removing list item:', error);
      throw error;
    }
    return data;
  }

  async deleteList(listId: string) {
    const { data, error } = await this.supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .select();

    if (error) {
      this.logger.error('Error deleting list:', error);
      throw error;
    }
    return data;
  }
}
