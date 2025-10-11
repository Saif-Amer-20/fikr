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

  async update(id: number, data: { name?: string; description?: string; permissionKeys?: string[] }) {
    const role = await this.findOne(id); // This will throw if not found
    const { name, description, permissionKeys } = data;
    
    return this.prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: permissionKeys
          ? {
              deleteMany: {},
              create: permissionKeys.map((key) => ({ permission: { connect: { key } } }))
            }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } }
    });
  }

  async remove(id: number) {
    const role = await this.findOne(id); // This will throw if not found
    await this.prisma.role.delete({ where: { id } });
    return { message: 'Role deleted successfully' };
  }
}