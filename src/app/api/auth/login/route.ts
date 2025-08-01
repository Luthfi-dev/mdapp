
import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth-utils';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateTokens, setTokenCookie } from '@/lib/jwt';
import type { UserForToken } from '@/lib/jwt';

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(1, { message: "Kata sandi tidak boleh kosong." }),
});

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: validationResult.error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    connection = await db.getConnection();
    const [rows]: [any[], any] = await connection.execute(
      'SELECT id, name, email, password as passwordHash, role_id, status FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Email atau kata sandi salah.' }, { status: 401 });
    }

    const user = rows[0];

    if (user.status === 'deactivated' || user.status === 'blocked') {
        return NextResponse.json({ 
            success: false, 
            message: 'Akun Anda tidak aktif. Silakan hubungi administrator.' 
        }, { status: 403 });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Email atau kata sandi salah.' }, { status: 401 });
    }

    // Generate JWT
    const userForToken: UserForToken = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_id, // Assuming role_id maps to a role name/id
    };
    
    const { accessToken, refreshToken } = generateTokens(userForToken);

    // Set refresh token in secure cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      accessToken,
      user: { name: user.name, email: user.email, role_id: user.role_id } 
    }, { status: 200 });

    setTokenCookie(response, refreshToken);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan yang tidak terduga.'
    }, { status: 500 });
  } finally {
    if (connection) {
        connection.release();
    }
  }
}
