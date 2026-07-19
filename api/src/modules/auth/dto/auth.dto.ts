import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre!: string;

  @IsEmail({}, { message: 'Email debe ser valido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Contrasena debe tener al menos 8 caracteres' })
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Contrasena debe contener mayuscula, minuscula, numero y caracter especial',
  })
  password!: string;

  @IsIn(['ADMIN', 'OPERADOR'])
  rol!: 'ADMIN' | 'OPERADOR';

  @IsOptional()
  @IsString()
  sedeId?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email debe ser valido' })
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class ChangePasswordDto {
  @IsString() @MinLength(1) currentPassword!: string;
  @IsString() @MinLength(12) @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La nueva contraseña debe incluir mayúscula, minúscula, número y carácter especial',
  })
  newPassword!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email debe ser valido' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString() @MinLength(32) @MaxLength(256)
  token!: string;

  @IsString() @MinLength(12) @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La nueva contraseña debe incluir mayúscula, minúscula, número y carácter especial',
  })
  newPassword!: string;
}

export class AuthResponseDto {
  access_token!: string;
  csrf_token!: string;
  user!: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    sedeId?: string | null;
    mustChangePassword?: boolean;
  };
}
