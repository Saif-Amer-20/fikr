import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateDepartmentDto {
  name: string;
  nameEn?: string;
  description?: string;
  active: boolean;
}

export interface UpdateDepartmentDto {
  name?: string;
  nameEn?: string;
  description?: string;
  active?: boolean;
}

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Mock data for departments
    return [
      { id: '1', name: 'تقنية المعلومات', nameEn: 'IT', description: 'قسم التقنية والبرمجة', active: true },
      { id: '2', name: 'الموارد البشرية', nameEn: 'HR', description: 'قسم الموارد البشرية', active: true },
      { id: '3', name: 'المالية', nameEn: 'Finance', description: 'القسم المالي والمحاسبة', active: true },
      { id: '4', name: 'التسويق', nameEn: 'Marketing', description: 'قسم التسويق والمبيعات', active: true },
      { id: '5', name: 'العمليات', nameEn: 'Operations', description: 'قسم العمليات والإنتاج', active: true }
    ];
  }

  async findOne(id: string) {
    const departments = await this.findAll();
    return departments.find(dept => dept.id === id);
  }

  async create(data: CreateDepartmentDto) {
    const newDepartment = {
      id: Date.now().toString(),
      ...data
    };
    return newDepartment;
  }

  async update(id: string, data: UpdateDepartmentDto) {
    const department = await this.findOne(id);
    if (!department) {
      throw new Error('Department not found');
    }
    return { ...department, ...data };
  }

  async remove(id: string) {
    const department = await this.findOne(id);
    if (!department) {
      throw new Error('Department not found');
    }
    return { message: 'Department deleted successfully' };
  }
}