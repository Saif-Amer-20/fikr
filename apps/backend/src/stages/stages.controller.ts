import { Body, Controller, Get, Param, Post, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StagesService } from './stages.service';
import { UpdateIdeaStageDto } from './dto/update-idea-stage.dto';
import { BulkUpdateDto } from './dto/bulk-update.dto';

@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  getAllStages() {
    return this.stagesService.getAllStages();
  }

  @Get('statistics')
  getStageStatistics() {
    return this.stagesService.getStageStatistics();
  }

  @Get('transitions')
  getAvailableTransitions() {
    return this.stagesService.getAvailableTransitions();
  }

  @Get('workflow')
  getStageWorkflow() {
    return this.stagesService.getStageWorkflow();
  }

  @Get('ideas/:stage')
  getIdeasByStage(@Param('stage') stage: string) {
    return this.stagesService.getIdeasByStage(stage);
  }

  @Put('ideas/:id/stage')
  updateIdeaStage(
    @Param('id', ParseIntPipe) ideaId: number,
    @Body() updateStageDto: UpdateIdeaStageDto
  ) {
    return this.stagesService.updateIdeaStage(ideaId, updateStageDto);
  }

  @Get('ideas/:id/history')
  getIdeaStageHistory(@Param('id', ParseIntPipe) ideaId: number) {
    return this.stagesService.getIdeaStageHistory(ideaId);
  }

  @Post('bulk-update')
  bulkUpdateStages(@Body() bulkUpdateDto: BulkUpdateDto) {
    // Transform the DTO to the format expected by the service
    const updates = bulkUpdateDto.ideaIds.map(ideaId => ({
      ideaId,
      stage: bulkUpdateDto.stage,
      status: bulkUpdateDto.status,
      notes: bulkUpdateDto.comment,
      updatedBy: bulkUpdateDto.updatedBy
    }));
    
    return this.stagesService.bulkUpdateStages(updates);
  }
}