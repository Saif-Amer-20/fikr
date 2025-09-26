import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BulkUpdateDto {
  @IsArray()
  @IsNotEmpty()
  ideaIds: number[];

  @IsString()
  @IsNotEmpty()
  stage: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  @IsNotEmpty()
  updatedBy: string;

  @IsOptional()
  @IsString()
  comment?: string;
}