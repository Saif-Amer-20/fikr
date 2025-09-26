import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateIdeaStageDto, IdeaStage, IdeaStatus } from './dto/update-idea-stage.dto';

@Injectable()
export class StagesService {
  constructor(private prisma: PrismaService) {}

  // Arabic labels for stages
  private stageLabels = {
    'muqadama': 'مُقدمة',
    'taqyeem_alaqran': 'تقييم الأقران',
    'murajaat_allajana': 'مراجعة اللجنة',
    'dirasat_aljadwa': 'دراسة الجدوى',
    'almuwafaqa': 'الموافقة',
    'altasleem': 'التسليم',
    'altanfeedh': 'التنفيذ',
  };

  private statusLabels = {
    'maswada': 'مسودة',
    'mursala': 'مُرسلة',
    'qaid_almurajaa': 'قيد المراجعة',
    'muwafaq_alayha': 'مُوافق عليها',
    'marfuda': 'مرفوضة',
    'qaid_altanfeedh': 'قيد التنفيذ',
  };

  // Define allowed stage transitions
  private stageTransitions = {
    'muqadama': ['taqyeem_alaqran', 'marfuda'],
    'taqyeem_alaqran': ['murajaat_allajana', 'muqadama', 'marfuda'],
    'murajaat_allajana': ['dirasat_aljadwa', 'almuwafaqa', 'taqyeem_alaqran', 'marfuda'], // Added direct approval option
    'dirasat_aljadwa': ['almuwafaqa', 'murajaat_allajana', 'marfuda'],
    'almuwafaqa': ['altasleem', 'dirasat_aljadwa', 'marfuda'],
    'altasleem': ['altanfeedh', 'almuwafaqa'],
    'altanfeedh': ['altasleem'], // Can go back to handoff for revisions
  };

  // Define stage-status relationships
  private stageStatusMapping = {
    'muqadama': ['mursala', 'qaid_almurajaa'],
    'taqyeem_alaqran': ['qaid_almurajaa'],
    'murajaat_allajana': ['qaid_almurajaa'],
    'dirasat_aljadwa': ['qaid_almurajaa'],
    'almuwafaqa': ['muwafaq_alayha', 'marfuda'],
    'altasleem': ['muwafaq_alayha', 'qaid_altanfeedh'],
    'altanfeedh': ['qaid_altanfeedh'],
  };

  async getAllStages() {
    const stages = Object.keys(this.stageLabels).map(key => ({
      key,
      label: this.stageLabels[key],
      allowedStatuses: this.stageStatusMapping[key] || [],
      nextStages: this.stageTransitions[key] || [],
    }));

    return {
      stages,
      statusLabels: this.statusLabels,
    };
  }

  async getStageStatistics() {
    const stats = await this.prisma.idea.groupBy({
      by: ['stage'],
      _count: {
        id: true,
      },
    });

    const statusStats = await this.prisma.idea.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return {
      stageStats: stats.map(stat => ({
        stage: stat.stage,
        label: this.stageLabels[stat.stage] || stat.stage,
        count: stat._count.id,
      })),
      statusStats: statusStats.map(stat => ({
        status: stat.status,
        label: this.statusLabels[stat.status] || stat.status,
        count: stat._count.id,
      })),
      totalIdeas: await this.prisma.idea.count(),
    };
  }

  async getAvailableTransitions() {
    return {
      transitions: this.stageTransitions,
      stageLabels: this.stageLabels,
      statusLabels: this.statusLabels,
    };
  }

  async getIdeasByStage(stage: string) {
    if (!this.stageLabels[stage]) {
      throw new BadRequestException(`Invalid stage: ${stage}`);
    }

    const ideas = await this.prisma.idea.findMany({
      where: { stage: stage as any },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return {
      stage,
      stageLabel: this.stageLabels[stage],
      ideas: ideas.map(idea => ({
        ...idea,
        stageLabel: this.stageLabels[idea.stage],
        statusLabel: this.statusLabels[idea.status],
      })),
      count: ideas.length,
    };
  }

  async updateIdeaStage(ideaId: number, updateDto: UpdateIdeaStageDto) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new NotFoundException(`Idea with ID ${ideaId} not found`);
    }

    // Validate stage transition
    const allowedNextStages = this.stageTransitions[idea.stage] || [];
    if (!allowedNextStages.includes(updateDto.stage) && idea.stage !== updateDto.stage) {
      throw new BadRequestException(
        `Cannot transition from ${this.stageLabels[idea.stage]} to ${this.stageLabels[updateDto.stage]}`
      );
    }

    // Validate status for the new stage
    if (updateDto.status) {
      const allowedStatuses = this.stageStatusMapping[updateDto.stage] || [];
      if (!allowedStatuses.includes(updateDto.status)) {
        throw new BadRequestException(
          `Status ${this.statusLabels[updateDto.status]} is not allowed for stage ${this.stageLabels[updateDto.stage]}`
        );
      }
    }

    // Update the idea
    const updatedIdea = await this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        stage: updateDto.stage,
        status: updateDto.status || idea.status,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    // Log the stage change (you could create a separate StageHistory table)
    console.log(`Stage updated for idea ${ideaId}: ${idea.stage} -> ${updateDto.stage} by ${updateDto.updatedBy}`);

    return {
      ...updatedIdea,
      stageLabel: this.stageLabels[updatedIdea.stage],
      statusLabel: this.statusLabels[updatedIdea.status],
      previousStage: idea.stage,
      previousStageLabel: this.stageLabels[idea.stage],
    };
  }

  async getIdeaStageHistory(ideaId: number) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        id: true,
        title: true,
        stage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!idea) {
      throw new NotFoundException(`Idea with ID ${ideaId} not found`);
    }

    // For now, return current state. In a real app, you'd have a StageHistory table
    return {
      ideaId: idea.id,
      title: idea.title,
      currentStage: idea.stage,
      currentStageLabel: this.stageLabels[idea.stage],
      currentStatus: idea.status,
      currentStatusLabel: this.statusLabels[idea.status],
      history: [
        {
          stage: 'muqadama',
          stageLabel: this.stageLabels['muqadama'],
          status: 'mursala',
          statusLabel: this.statusLabels['mursala'],
          timestamp: idea.createdAt,
          notes: 'Idea submitted',
        },
        // Add more history entries based on your tracking needs
      ],
    };
  }

  async bulkUpdateStages(updates: Array<{ ideaId: number; stage: string; status?: string; notes?: string; updatedBy?: string }>) {
    const results: any[] = [];
    
    for (const update of updates) {
      try {
        const result = await this.updateIdeaStage(update.ideaId, {
          stage: update.stage as IdeaStage,
          status: update.status as IdeaStatus,
          notes: update.notes,
          updatedBy: update.updatedBy || 'bulk-update', // Use provided updatedBy or default
        });
        results.push({ ideaId: update.ideaId, success: true, result });
      } catch (error: any) {
        results.push({ 
          ideaId: update.ideaId, 
          success: false, 
          error: error.message 
        });
      }
    }

    return {
      totalUpdates: updates.length,
      successful: results.filter((r: any) => r.success).length,
      failed: results.filter((r: any) => !r.success).length,
      results,
    };
  }

  async getStageWorkflow() {
    return {
      stages: Object.keys(this.stageLabels).map(key => ({
        key,
        label: this.stageLabels[key],
        nextStages: this.stageTransitions[key] || [],
        allowedStatuses: this.stageStatusMapping[key] || [],
      })),
      workflow: {
        description: 'مسار إدارة الأفكار',
        stages: [
          {
            key: 'muqadama',
            label: 'مُقدمة',
            description: 'تم استلام الفكرة وهي قيد المراجعة الأولية',
            icon: '📝',
            color: 'blue',
          },
          {
            key: 'taqyeem_alaqran',
            label: 'تقييم الأقران',
            description: 'الفكرة تحت مراجعة الزملاء والخبراء',
            icon: '👥',
            color: 'indigo',
          },
          {
            key: 'murajaat_allajana',
            label: 'مراجعة اللجنة',
            description: 'مراجعة اللجنة المختصة للفكرة',
            icon: '⚖️',
            color: 'yellow',
          },
          {
            key: 'dirasat_aljadwa',
            label: 'دراسة الجدوى',
            description: 'تقييم جدوى تطبيق الفكرة تقنياً ومالياً',
            icon: '📊',
            color: 'orange',
          },
          {
            key: 'almuwafaqa',
            label: 'الموافقة',
            description: 'تمت الموافقة على الفكرة وتجهيزها للتنفيذ',
            icon: '✅',
            color: 'green',
          },
          {
            key: 'altasleem',
            label: 'التسليم',
            description: 'تسليم الفكرة لفريق التنفيذ',
            icon: '🚀',
            color: 'purple',
          },
          {
            key: 'altanfeedh',
            label: 'التنفيذ',
            description: 'الفكرة قيد التنفيذ الفعلي',
            icon: '⚡',
            color: 'emerald',
          },
        ],
      },
    };
  }
}