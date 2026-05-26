import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateSedeDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: string;
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
  estado?: string;
}
