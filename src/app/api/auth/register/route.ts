
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth-utils';
import { z } from 'zod';
import { db } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2';
import { randomBytes } from 'crypto';

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama harus memiliki setidaknya 3 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(8, { message: "Kata sandi harus memiliki setidaknya 8 karakter." }),
  repeatPassword: z.string()
}).refine(data => data.password === data.repeatPassword, {
  message: "Kata sandi tidak cocok.",
  path: ["repeatPassword"], // path to show error on
});

// Role IDs from schema.sql
const ROLE_ID_USER = 3; 

const generateReferralCode = () => {
    return randomBytes(3).toString('hex').toUpperCase();
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    
    // 1. Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: validationResult.error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { name, email, password } = validationResult.data;
    
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 2. Check if user already exists
    const [existingUsers]: [any[], any] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      await connection.rollback();
      return NextResponse.json({ success: false, message: 'Email ini sudah terdaftar.' }, { status: 409 });
    }

    // 3. Hash the password
    const hashedPassword = await hashPassword(password);
    
    // 4. Generate referral code
    const referralCode = generateReferralCode();

    // 5. Create the new user in the `users` table
    const [userResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role_id, referral_code) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, ROLE_ID_USER, referralCode]
    );

    const newUserId = userResult.insertId;

    if (!newUserId) {
        throw new Error('Gagal membuat pengguna baru di tabel users.');
    }

    // 6. Assign the default role to the new user in the `user_roles` table
    const [roleResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [newUserId, ROLE_ID_USER]
    );
    
    if (roleResult.affectedRows === 0) {
        throw new Error('Gagal menetapkan peran untuk pengguna baru.');
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan masuk.',
      user: { id: newUserId, name, email, role: 'user' } // Do NOT return the password
    }, { status: 201 });

  } catch (error) {
    if (connection) await connection.rollback();
    
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    
    return NextResponse.json({
      success: false,
      message: `Registrasi gagal: ${errorMessage}`
    }, { status: 500 });

  } finally {
      if (connection) {
          connection.release();
      }
  }
}
