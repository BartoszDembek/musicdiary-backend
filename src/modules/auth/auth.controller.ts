import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

// DTO dla danych uwierzytelniania
export class AuthDto {

  @IsString()
  @MinLength(6)
  username: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  avatar?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async signUp(@Body() authDto: AuthDto) {
    return await this.authService.signUp(authDto.username,authDto.email, authDto.password, authDto.avatar);
  }

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    console.log('Login attempt with data:', authDto);
    try {
      return await this.authService.login(authDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Get('validate')
  async validateToken(@Headers('authorization') token: string) {
    return await this.authService.validateToken(token.replace('Bearer ', ''));
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      if (!body.refresh_token) {
        throw new UnauthorizedException('Missing refresh token');
      }
      
      console.log('[Auth Controller] Attempting token refresh');
      const result = await this.authService.refreshToken(body.refresh_token);
      console.log('[Auth Controller] Token refresh successful');
      
      return result;
    } catch (error) {
      console.error('[Auth Controller] Token refresh failed:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('resend/:email')
  async resend(@Param() email: string) {
    console.log('Email validation resend:', email);
    try {
      return await this.authService.resend(email);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}