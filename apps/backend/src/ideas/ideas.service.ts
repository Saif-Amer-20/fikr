import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';

@Injectable()
export class IdeasService {
  constructor(private prisma: PrismaService) {}

  async findAll(userRole?: string) {
    // إذا كان المستخدم مدير، يرى جميع الأفكار
    // إذا لم يكن مدير، لا يرى الأفكار في مرحلة "مُقدمة"
    const whereCondition = userRole === 'admin' ? {} : {
      stage: {
        not: 'muqadama' as any
      }
    };

    return this.prisma.idea.findMany({ 
      where: whereCondition,
      include: { 
        owner: true, 
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      } 
    });
  }

  async findOne(id: number) {
    const idea = await this.prisma.idea.findUnique({ 
      where: { id }, 
      include: { 
        owner: true, 
        comments: {
          include: {
            author: true
          }
        },
        votes: {
          include: {
            voter: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      } 
    });
    if (!idea) throw new NotFoundException('Idea not found');
    return idea;
  }

  async create(dto: CreateIdeaDto, ownerId: number) {
    return this.prisma.idea.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        details: dto.details,
        category: dto.category,
        owner: { connect: { id: ownerId } },
        status: 'mursala',
        stage: 'muqadama',
      },
    });
  }

  async update(id: number, dto: CreateIdeaDto, ownerId: number) {
    // التحقق من وجود الفكرة
    const idea = await this.prisma.idea.findUnique({ 
      where: { id },
      include: { owner: true }
    });
    
    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    // التحقق من أن المستخدم هو صاحب الفكرة
    if (idea.ownerId !== ownerId) {
      throw new Error('Unauthorized: You can only edit your own ideas');
    }

    // التحقق من أن الفكرة قابلة للتعديل (مسودة أو مُرسلة فقط)
    if (!['maswada', 'mursala'].includes(idea.status)) {
      throw new Error('Cannot edit idea at this stage');
    }

    return this.prisma.idea.update({
      where: { id },
      data: {
        title: dto.title,
        summary: dto.summary,
        details: dto.details,
        category: dto.category,
      },
      include: {
        owner: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    });
  }

  async vote(ideaId: number, voterId: number) {
    // التحقق من أن المستخدم مسموح له بالتصويت
    const user = await this.prisma.user.findUnique({
      where: { id: voterId }
    });

    if (!user || !user.canVote) {
      throw new Error('User is not allowed to vote');
    }

    // Check if user already voted
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        ideaId: ideaId,
        voterId: voterId
      }
    });

    if (existingVote) {
      // Remove vote if already exists (toggle behavior)
      await this.prisma.vote.delete({
        where: { id: existingVote.id }
      });
      return { message: 'Vote removed', voted: false };
    } else {
      // Add vote if not exists
      await this.prisma.vote.create({
        data: {
          ideaId: ideaId,
          voterId: voterId
        }
      });
      return { message: 'Vote added', voted: true };
    }
  }

  async addComment(ideaId: number, authorId: number, content: string, isAnonymous: boolean = false) {
    // Verify idea exists
    const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new NotFoundException('Idea not found');

    return this.prisma.comment.create({
      data: {
        ideaId: ideaId,
        authorId: authorId,
        content: content,
        isAnonymous: isAnonymous
      },
      include: {
        author: true
      }
    });
  }

  // إدارة الأفكار للمديرين
  async approvePendingIdea(ideaId: number) {
    const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new NotFoundException('Idea not found');

    if (idea.stage !== 'muqadama') {
      throw new Error('Idea is not in pending stage');
    }

    return this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        stage: 'taqyeem_alaqran',
        status: 'qaid_almurajaa'
      }
    });
  }

  async rejectPendingIdea(ideaId: number) {
    const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new NotFoundException('Idea not found');

    if (idea.stage !== 'muqadama') {
      throw new Error('Idea is not in pending stage');
    }

    return this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        status: 'marfuda'
      }
    });
  }

  // الحصول على الأفكار المُقدمة للمراجعة (للمديرين فقط)
  async getPendingIdeas() {
    return this.prisma.idea.findMany({
      where: {
        stage: 'muqadama'
      },
      include: {
        owner: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    });
  }
}