import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export enum IdeaStage {
  muqadama = 'muqadama',
  taqyeem_alaqran = 'taqyeem_alaqran',
  murajaat_allajana = 'murajaat_allajana',
  dirasat_aljadwa = 'dirasat_aljadwa',
  almuwafaqa = 'almuwafaqa',
  altasleem = 'altasleem',
  altanfeedh = 'altanfeedh',
}

export enum IdeaStatus {
  maswada = 'maswada',
  mursala = 'mursala',
  qaid_almurajaa = 'qaid_almurajaa',
  muwafaq_alayha = 'muwafaq_alayha',
  marfuda = 'marfuda',
  qaid_altanfeedh = 'qaid_altanfeedh',
}

export class UpdateIdeaStageDto {
  @IsNotEmpty()
  @IsEnum(IdeaStage)
  stage: IdeaStage;

  @IsOptional()
  @IsEnum(IdeaStatus)
  status?: IdeaStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsNotEmpty()
  @IsString()
  updatedBy: string; // In a real app, this would come from JWT
}