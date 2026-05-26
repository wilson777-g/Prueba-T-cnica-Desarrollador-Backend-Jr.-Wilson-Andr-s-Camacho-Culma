import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Contraseña debe contener mayúscula, minúscula, número y carácter especial',
  })
  password: string;

  sedeId?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class AuthResponseDto {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    sedeId?: string;
  };
}
