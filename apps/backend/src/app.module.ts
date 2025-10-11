import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { IdeasModule } from './ideas/ideas.module';
import { AuthModule } from './auth/auth.module';
import { StagesModule } from './stages/stages.module';
import { CategoriesModule } from './categories/categories.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    RolesModule,
    IdeasModule,
    AuthModule,
    StagesModule,
    CategoriesModule,
    DepartmentsModule,
  ],
})
export class AppModule {}