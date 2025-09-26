import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

interface LoginDto {
  email: string;
  password?: string; // Optional since it's a demo
}

interface RegisterDto {
  name: string;
  email: string;
  password: string;
  department?: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string): Promise<any> {
    console.log('Validating user with email:', email);
    if (!email) {
      console.log('Email is undefined or null');
      throw new UnauthorizedException('البريد الإلكتروني مطلوب');
    }
    
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && user.isActive) {
        console.log('User found and active:', user.id);
        return user;
      }
      console.log('User not found or inactive');
      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null; // Don't throw here, let the calling method handle it
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('بيانات اعتماد غير صحيحة');
      }
      
      const payload = { 
        sub: user.id, 
        email: user.email,
        role: user.role?.name || 'user'
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('خطأ في تسجيل الدخول');
    }
  }

  async register(registerData: RegisterDto) {
    try {
      console.log('Registration attempt for:', registerData.email);
      
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(registerData.email);
      if (existingUser) {
        console.log('User already exists:', registerData.email);
        throw new ConflictException('المستخدم موجود بالفعل');
      }

      // Create new user (in this demo app, password is not actually stored/used)
      console.log('Creating new user...');
      const userData = await this.usersService.create({
        name: registerData.name,
        email: registerData.email,
        department: registerData.department,
      });

      console.log('User created with ID:', userData.id);

      // Generate JWT token directly from the created user (which already includes role)
      const payload = { 
        sub: userData.id, 
        email: userData.email,
        role: userData.role?.name || 'user'
      };
      
      const token = this.jwtService.sign(payload);
      console.log('JWT token generated successfully');
      
      return {
        access_token: token,
        user: userData,
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      // Provide more specific error information
      const errorMessage = error.message || 'خطأ غير معروف';
      throw new UnauthorizedException('خطأ في التسجيل: ' + errorMessage);
    }
  }
}