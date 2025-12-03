import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
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

  @Put(':listId')
  updateList(@Param('listId') listId: string, @Body() data: any) {
    return this.listService.updateList(listId, data);
  }

  @Put(':listId/items/reorder')
  updateListItemsOrder(@Param('listId') listId: string, @Body('items') items: any[]) {
    return this.listService.updateListItemsOrder(listId, items);
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
