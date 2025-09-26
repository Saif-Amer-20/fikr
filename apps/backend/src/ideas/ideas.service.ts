import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';

@Injectable()
export class IdeasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.idea.findMany({ 
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

  async vote(ideaId: number, voterId: number) {
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
}