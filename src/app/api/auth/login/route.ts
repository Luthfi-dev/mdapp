import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth-utils';
import { z } from 'zod';
import { db } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(1, { message: "Kata sandi tidak boleh kosong." }),
});

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();

    // 1. Validasi input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: validationResult.error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    // 2. Cari pengguna di database
    connection = await db.getConnection();
    const [rows]: [any[], any] = await connection.execute(
      'SELECT id, name, email, password as passwordHash, role_id, status FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Email atau kata sandi salah.' }, { status: 401 });
    }

    const user = rows[0];

    // 3. Periksa status akun SEBELUM memverifikasi password
    if (user.status === 'deactivated' || user.status === 'blocked') {
        return NextResponse.json({ 
            success: false, 
            message: 'Akun Anda tidak aktif. Silakan hubungi administrator.' 
        }, { status: 403 }); // 403 Forbidden adalah status yang lebih sesuai
    }


    // 4. Verifikasi password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Email atau kata sandi salah.' }, { status: 401 });
    }

    // 5. Buat sesi/token (Placeholder untuk logika JWT atau sesi)
    // Untuk sekarang, kita hanya kembalikan data pengguna.
    console.log('--- User Login Successful ---');
    console.log('User:', user.email, 'Status:', user.status);
    console.log('This is where you would create a JWT or session.');
    console.log('----------------------------');


    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      // JANGAN kembalikan hash password
      user: { name: user.name, email: user.email, role_id: user.role_id } 
    }, { status: 200 });

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
