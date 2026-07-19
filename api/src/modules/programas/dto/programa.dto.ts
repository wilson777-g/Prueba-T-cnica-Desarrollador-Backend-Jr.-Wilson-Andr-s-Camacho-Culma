import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';

export class CreateProgramaDto {
  @IsString()
  @Matches(/^[A-Z0-9-]{3,12}$/)
  codigo!: string;

  @IsString()
  @MinLength(3)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @Max(60)
  duracionMeses!: number;

  @IsIn(['PRESENCIAL', 'HIBRIDA', 'VIRTUAL'])
  modalidad!: 'PRESENCIAL' | 'HIBRIDA' | 'VIRTUAL';
}

export class UpdateProgramaDto {
  @IsOptional() @IsString() @MinLength(3) nombre?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsInt() @Min(1) @Max(60) duracionMeses?: number;
  @IsOptional() @IsIn(['PRESENCIAL', 'HIBRIDA', 'VIRTUAL']) modalidad?: 'PRESENCIAL' | 'HIBRIDA' | 'VIRTUAL';
  @IsOptional() @IsIn(['ACTIVO', 'INACTIVO']) estado?: 'ACTIVO' | 'INACTIVO';
}
