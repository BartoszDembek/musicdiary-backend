import { Controller, Post, Body, Get, Put, Headers, UnauthorizedException, Query, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    try {
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

  @Put(':id')
  async updateUserProfile(@Param('id') id: string, @Body() updateData: any) {
    try {
      const updatedUser = await this.userService.updateUserProfile(id, updateData);
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
}