import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class CreateMatriculaDto {
  @IsString() estudianteId!: string;
  @IsString() programaId!: string;
  @IsString() sedeId!: string;
  @Matches(/^20\d{2}-[12]$/, { message: 'El periodo debe tener formato AAAA-1 o AAAA-2' })
  periodo!: string;
}

export class FilterMatriculasDto {
  @IsOptional() @IsString() sedeId?: string;
  @IsOptional() @IsString() periodo?: string;
  @IsOptional() @IsIn(['ACTIVA', 'FINALIZADA', 'CANCELADA']) estado?: 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';
}

export class UpdateMatriculaEstadoDto {
  @IsIn(['ACTIVA', 'FINALIZADA', 'CANCELADA'])
  estado!: 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';
}
