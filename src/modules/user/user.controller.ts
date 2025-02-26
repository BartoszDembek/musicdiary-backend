import { Controller, Post, Body, Get, Headers, UnauthorizedException, Query, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    try {
        await this.userService.debugCheckUser(id);
        const user = await this.userService.getUserProfile(id);
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
      } catch (error) {
        console.error('Get user error:', error);
        throw error;
      }
  }
}