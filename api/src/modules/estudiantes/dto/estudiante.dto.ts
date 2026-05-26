import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export type EstudianteEstadoValue = 'ACTIVO' | 'INACTIVO' | 'RETIRADO';

export class CreateEstudianteDto {
  @IsString()
  @MinLength(3)
  nombreCompleto!: string;

  @IsEmail({}, { message: 'Email debe ser valido' })
  email!: string;

  @IsString()
  @Matches(/^[0-9]{7,15}$/, {
    message: 'Telefono debe contener solo numeros de 7 a 15 digitos',
  })
  telefono!: string;

  @IsString()
  @Matches(/^[0-9]{5,20}$/, {
    message: 'Documento debe ser valido',
  })
  documento!: string;

  @IsString()
  sedeId!: string;

  @IsString()
  @MinLength(2)
  programa!: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'RETIRADO'])
  estado?: EstudianteEstadoValue;
}

export class UpdateEstudianteDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  nombreCompleto?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email debe ser valido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{7,15}$/, {
    message: 'Telefono debe contener solo numeros de 7 a 15 digitos',
  })
  telefono?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  programa?: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'RETIRADO'])
  estado?: EstudianteEstadoValue;
}

export class FilterEstudiantesDto {
  @IsOptional()
  @IsString()
  sedeId?: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'RETIRADO'])
  estado?: EstudianteEstadoValue;

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
