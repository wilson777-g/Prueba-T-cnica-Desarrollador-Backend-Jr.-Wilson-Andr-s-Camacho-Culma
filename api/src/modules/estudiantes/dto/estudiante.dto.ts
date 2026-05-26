import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateEstudianteDto {
  @IsString()
  @MinLength(3)
  nombreCompleto: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9]{7,15}$/, {
    message: 'Teléfono debe contener solo números (7-15 dígitos)',
  })
  telefono: string;

  @IsString()
  @Matches(/^[0-9]{5,20}$/, {
    message: 'Documento debe ser válido',
  })
  documento: string;

  @IsString()
  sedeId: string;

  @IsString()
  @MinLength(2)
  programa: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'RETIRADO'])
  estado?: string;
}

export class UpdateEstudianteDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  nombreCompleto?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  programa?: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'RETIRADO'])
  estado?: string;
}

export class FilterEstudiantesDto {
  @IsOptional()
  @IsString()
  sedeId?: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'RETIRADO'])
  estado?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
