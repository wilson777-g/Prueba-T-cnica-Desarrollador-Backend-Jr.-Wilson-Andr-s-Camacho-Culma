import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateOperadorDto {
  @IsString() @MinLength(3) @MaxLength(100) nombre!: string;
  @IsEmail() email!: string;
  @IsString() sedeId!: string;
  @IsString() @MinLength(8) @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  password!: string;
}

export class UpdateOperadorDto {
  @IsOptional() @IsString() @MinLength(3) nombre?: string;
  @IsOptional() @IsString() sedeId?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class AuditFilterDto {
  @IsOptional() @IsString() entidad?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}
