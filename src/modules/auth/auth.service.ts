import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './auth.controller';

interface LoginAttempt {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly ATTEMPT_RESET_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      configService.get('SUPABASE_URL') || 'https://xejncmdvbgkpcmypsnwh.supabase.co',
      configService.get('SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlam5jbWR2YmdrcGNteXBzbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMTIxNzAsImV4cCI6MjA1MzU4ODE3MH0.zncqgGsHa1MWzmMDEUKbTPlaTX2MWtNNKqIZ1sGc7kY'
    );
    
    // Clean up old login attempts every hour
    setInterval(() => this.cleanupLoginAttempts(), 60 * 60 * 1000);
  }

  async signUp(username:string,email: string, password: string) {
    console.log(`[Auth Service] Próba rejestracji użytkownika: ${email}`);
    try {
      // 1. Rejestracja użytkownika w auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: email,
        password: password
      })

      if (authError) throw authError;

      // 2. Dodanie dodatkowych danych do tabeli users
      const { data: userRecord, error: userError } = await this.supabase
      .from('users')
      .update(
        {
          username: username,
          created_at: new Date(),
          updated_at: new Date()
        }
      )
      .eq('id', authData.user?.id) // warunek gdzie id jest równe id użytkownika
      .select() 

      if (userError) throw userError

      return authData;
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error.message)
      return error;
    }
  }

  

  async validateToken(token: string) {
    try {      
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        console.log('Supabase error details:', error);
        throw error;
      }
      
      return user;
    } catch (error) {
      console.error(`[Auth Service] Błąd weryfikacji tokenu:`, error);
      throw error;
    }
  }

  private checkLoginAttempts(email: string): void {
    const attempt = this.loginAttempts.get(email);
    
    // Jeśli nie ma wcześniejszych prób, pozwalamy na logowanie
    if (!attempt) {
      return;
    }

    // Sprawdzamy czy użytkownik jest zablokowany
    if (attempt.blockedUntil && Date.now() < attempt.blockedUntil) {
      const remainingTime = Math.ceil((attempt.blockedUntil - Date.now()) / 1000 / 60);
      throw new UnauthorizedException(
        `Too many login attempts. Please try again in ${remainingTime} minutes.`
      );
    }

    // Resetujemy próby po czasie
    if (Date.now() - attempt.lastAttempt > this.ATTEMPT_RESET_TIME) {
      this.loginAttempts.delete(email);
      return;
    }

    // Blokujemy po przekroczeniu limitu prób
    if (attempt.attempts >= this.MAX_ATTEMPTS) {
      attempt.blockedUntil = Date.now() + this.BLOCK_DURATION;
      this.loginAttempts.set(email, attempt);
      throw new UnauthorizedException(
        `Too many login attempts. Please try again in 15 minutes.`
      );
    }
  }

  async resend(email:string){
    try {
      await this.supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://example.com/welcome'
        }
      })
    } catch (error) {
      console.warn('Resend email validation warning:', error);
    }
  }

  async login(authDto: AuthDto) {
    try {
      // Sprawdzamy próby logowania przed wywołaniem Supabase
      try {
        this.checkLoginAttempts(authDto.email);
      } catch (error) {
        // Logujemy błąd ale pozwalamy kontynuować jeśli to pierwszy attempt
        if (error instanceof UnauthorizedException) {
          throw error; // Rzucamy dalej tylko jeśli przekroczono limit
        }
        console.warn('Login attempts check warning:', error);
      }

      console.log('Starting login for:', authDto.email);
      const { data: { session }, error } = await this.supabase.auth.signInWithPassword({
        email: authDto.email,
        password: authDto.password,
      });

      if (error) {
        // Zwiększamy licznik nieudanych prób
        const attempt = this.loginAttempts.get(authDto.email) || { 
          attempts: 0, 
          lastAttempt: Date.now() 
        };
        attempt.attempts++;
        this.loginAttempts.set(authDto.email, attempt);
        
        throw error;
      }

      // Resetujemy próby po udanym logowaniu
      this.loginAttempts.delete(authDto.email);

      if (!session) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user email is confirmed
      if (!session.user.email_confirmed_at) {
        console.log('Próba logowania z niepotwierdzonym adresem email:', authDto.email);
        throw new UnauthorizedException('Email not confirmed. Please verify your email address first.');
      }
      
      const response = {
        token: session.access_token,
        refreshToken: session.refresh_token,
        user: session.user
      };

      console.log('Zwracana odpowiedź:', response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      console.log('[Auth Service] Starting token refresh');
      
      const { data: { session }, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        console.error('[Auth Service] Supabase refresh error:', error);
        throw error;
      }

      if (!session?.access_token || !session?.refresh_token) {
        console.error('[Auth Service] Invalid session data received');
        throw new Error('Invalid session data');
      }

      console.log('[Auth Service] Token refresh successful');
      
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: session.user
      };
    } catch (error) {
      console.error('[Auth Service] Token refresh failed:', error);
      throw error;
    }
  }

  private cleanupLoginAttempts(): void {
    const now = Date.now();
    for (const [email, attempt] of this.loginAttempts.entries()) {
      if (now - attempt.lastAttempt > this.ATTEMPT_RESET_TIME) {
        this.loginAttempts.delete(email);
      }
    }
  }
}

// Dokumentacja: Interfejs użytkownika zgodny ze schematem Supabase
interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;  // Changed from updated_at
  user_metadata?: {
    name?: string;
    username?: string;
  };
  // Add other fields that Supabase returns
}

interface AuthResponse {
  session: {
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number;
    refresh_token: string;
  };
  user: User;
  token: string;
}