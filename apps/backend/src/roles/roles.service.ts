import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: { name: string; description?: string; permissionKeys?: string[] }) {
    const { name, description, permissionKeys } = data;
    return this.prisma.role.create({
      data: {
        name,
        description,
        permissions: permissionKeys
          ? {
              create: permissionKeys.map((key) => ({ permission: { connect: { key } } }))
            }
          : undefined,
      },
    });
  }
}