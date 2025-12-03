import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ListService } from './list.service';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  createList(@Body() body: { userId: string; title: string; description: string; isPublic: boolean }) {
    return this.listService.createList(body.userId, body.title, body.description, body.isPublic);
  }

  @Get('user/:userId')
  getUserLists(@Param('userId') userId: string) {
    return this.listService.getUserLists(userId);
  }

  @Get('search')
  searchLists(@Query('query') query: string) {
    return this.listService.searchLists(query);
  }

  @Get(':listId')
  getListDetails(@Param('listId') listId: string) {
    return this.listService.getListDetails(listId);
  }

  @Post(':listId/items')
  addListItem(@Param('listId') listId: string, @Body() item: any) {
    return this.listService.addListItem(listId, item);
  }

  @Delete(':listId/items/:itemId')
  removeListItem(@Param('listId') listId: string, @Param('itemId') itemId: string) {
    return this.listService.removeListItem(listId, itemId);
  }

  @Delete(':listId')
  deleteList(@Param('listId') listId: string) {
    return this.listService.deleteList(listId);
  }
}
