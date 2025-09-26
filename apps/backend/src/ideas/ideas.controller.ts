import { Body, Controller, Get, Param, Post, ParseIntPipe, Query } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll() {
    return this.ideasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ideasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateIdeaDto, @Query('ownerId', ParseIntPipe) ownerId: number) {
    // في تطبيق فعلي، يتم استخراج معرف المالك من JWT
    return this.ideasService.create(dto, ownerId);
  }

  @Post(':id/vote')
  vote(@Param('id', ParseIntPipe) id: number, @Query('userId') userId?: string) {
    // في تطبيق فعلي، يتم استخراج معرف المستخدم من JWT
    const userIdNum = userId ? parseInt(userId, 10) : 1; // Default to user 1 if not provided
    return this.ideasService.vote(id, userIdNum);
  }

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: any, 
    @Query('authorId') authorId?: string
  ) {
    // في تطبيق فعلي، يتم استخراج معرف المؤلف من JWT
    const authorIdNum = authorId ? parseInt(authorId, 10) : 1; // Default to user 1 if not provided
    const content = body.content;
    const isAnonymous = body.isAnonymous || false;
    return this.ideasService.addComment(id, authorIdNum, content, isAnonymous);
  }
}