import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UserService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(UserService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'https://xejncmdvbgkpcmypsnwh.supabase.co';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlam5jbWR2YmdrcGNteXBzbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMTIxNzAsImV4cCI6MjA1MzU4ODE3MH0.zncqgGsHa1MWzmMDEUKbTPlaTX2MWtNNKqIZ1sGc7kY';

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
      const { data: user, error } = await this.supabase
        .from('users')
        .select(`
          *,
          follows:follows(follow)
        `)
        .eq('id', id);

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
}


