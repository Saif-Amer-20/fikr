import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIdeaDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  summary: string;

  @IsNotEmpty()
  @IsString()
  details: string;

  @IsOptional()
  @IsString()
  category?: string;
}