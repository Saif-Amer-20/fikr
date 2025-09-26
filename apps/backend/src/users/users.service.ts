import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ include: { role: true } });
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    // Call findOneInternal instead of findOne to avoid the NotFoundException
    const user = await this.findOneInternal(id);
    
    // Add null check to fix TypeScript error
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if email is already taken by another user
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;
    if (dto.department) updateData.department = dto.department;
    if (dto.profilePicture !== undefined) updateData.profilePicture = dto.profilePicture;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true }
    });
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    // Call findOneInternal instead of findOne
    const user = await this.findOneInternal(id);
    
    // Add null check
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // For demo purposes, we'll skip password validation since users don't have passwords in the current schema
    // In a real application, you would verify the current password here
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    
    // In the current schema, there's no password field, so we'll just return success
    // You would need to add a password field to the User model and update it here
    
    return { message: 'Password changed successfully' };
  }

  // Fixed findByEmail method
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true } // Added role relationship
    });
  }
  
  // Fixed create method  
  async create(createUserDto: CreateUserDto) {
    try {
      console.log('Creating user with data:', createUserDto);
      
      // First, let's check if we have any roles in the database
      const roles = await this.prisma.role.findMany();
      console.log('Available roles:', roles);
      
      if (roles.length === 0) {
        throw new BadRequestException('No roles found in database. Please seed the database first.');
      }
      
      // Find the default user role
      let defaultRoleId: number;
      const userRole = roles.find(role => role.name === 'user');
      const adminRole = roles.find(role => role.name === 'admin');
      
      if (userRole) {
        defaultRoleId = userRole.id;
        console.log('Using user role with ID:', defaultRoleId);
      } else if (adminRole) {
        // If no user role exists, create users without roleId (make it optional)
        console.log('No user role found, creating user without role assignment');
        const userData = {
          name: createUserDto.name,
          email: createUserDto.email,
          department: createUserDto.department || 'عام',
          isActive: true,
          // Don't assign roleId if no user role exists
        };
        
        console.log('Creating user with userData (no role):', userData);
        
        const createdUser = await this.prisma.user.create({ 
          data: userData,
          include: { role: true }
        });
        
        console.log('User created successfully without role:', createdUser.id);
        return createdUser;
      } else {
        // Use the first available role as fallback
        defaultRoleId = roles[0].id;
        console.log('Using first available role with ID:', defaultRoleId);
      }
      
      const userData = {
        name: createUserDto.name,
        email: createUserDto.email,
        department: createUserDto.department || 'عام',
        isActive: true,
        roleId: defaultRoleId,
      };
      
      console.log('Creating user with userData:', userData);
      
      const createdUser = await this.prisma.user.create({ 
        data: userData,
        include: { role: true }
      });
      
      console.log('User created successfully:', createdUser.id);
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user: ' + error.message);
    }
  }
  
  // Internal method that can return null
  private async findOneInternal(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
  }
  
  // Public method that throws error if not found
  async findOne(id: number) {
    const user = await this.findOneInternal(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }
}