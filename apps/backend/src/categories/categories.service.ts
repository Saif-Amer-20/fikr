import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCategoryDto {
  name: string;
  nameEn?: string;
  description?: string;
  active: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  nameEn?: string;
  description?: string;
  active?: boolean;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // For now, return mock data since we don't have categories in the database schema yet
    return [
      { id: '1', name: 'التكنولوجيا', nameEn: 'Technology', description: 'أفكار تقنية ورقمية', active: true },
      { id: '2', name: 'الإبداع', nameEn: 'Innovation', description: 'أفكار إبداعية جديدة', active: true },
      { id: '3', name: 'التطوير', nameEn: 'Development', description: 'أفكار لتطوير العمليات', active: true },
      { id: '4', name: 'التحسين', nameEn: 'Improvement', description: 'أفكار لتحسين الخدمات', active: true },
      { id: '5', name: 'البيئة', nameEn: 'Environment', description: 'أفكار صديقة للبيئة', active: true }
    ];
  }

  async findOne(id: string) {
    // Mock implementation
    const categories = await this.findAll();
    return categories.find(cat => cat.id === id);
  }

  async create(data: CreateCategoryDto) {
    // Mock implementation - in real app would save to database
    const newCategory = {
      id: Date.now().toString(),
      ...data
    };
    return newCategory;
  }

  async update(id: string, data: UpdateCategoryDto) {
    // Mock implementation - in real app would update in database
    const category = await this.findOne(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category, ...data };
  }

  async remove(id: string) {
    // Mock implementation - in real app would delete from database
    const category = await this.findOne(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }
}