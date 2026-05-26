import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type SedeEstadoValue = 'ACTIVA' | 'INACTIVA';

export class CreateSedeDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  ciudad!: string;

  @IsString()
  @IsNotEmpty()
  direccion!: string;

  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: SedeEstadoValue;
}

export class UpdateSedeDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: SedeEstadoValue;
}
