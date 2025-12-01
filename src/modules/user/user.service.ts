import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UserService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(UserService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async debugCheckUser(id: string): Promise<void> {
    try {
      // Sprawdź listę wszystkich tabel
      const { data: tables, error: tablesError } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        this.logger.error('Error fetching tables:', tablesError);
        throw tablesError;
      }
      this.logger.debug('Available tables:', tables);

      // Sprawdź zapytanie do users
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('*');

      if (usersError) {
        this.logger.error('Error fetching users:', usersError);
        throw usersError;
      }
      this.logger.debug('All users in database:', { count: users?.length });

      // Sprawdź konkretnego użytkownika
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id);

      if (userError) {
        this.logger.error(`Error fetching user ${id}:`, userError);
        throw userError;
      }

      if (!userData || userData.length === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.debug('Found user:', { id, userData });
    } catch (error) {
      this.logger.error('Debug check failed:', error);
      throw error;
    }
  }

  async getUserProfile(id: string): Promise<any> {
    try {
      // Pobierz profil użytkownika z powiązanymi danymi
      const { data: user, error } = await this.supabase
        .from('users')
        .select(`
          *,
          follows:follows(*),
          reviews:reviews(*),
          favorites:favorites(*),
          review_comments:review_comments(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error fetching user:', error);
        throw error;
      }

      return user;
    } catch (error) {
      this.logger.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUserProfile(id: string, updateData: any): Promise<any> {
    try {
      const { data: updatedUser, error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select();
      if (error) {
        this.logger.error('Error updating user profile:', error);
        throw error;
      }
      return updatedUser;
    } catch (error) {
      this.logger.error('Error updating user profile:', error);
      throw error;
    }
  }
}


