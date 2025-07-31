
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth-utils';
import { z } from 'zod';
import { db } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2';

const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

// Role IDs from schema.sql
const ROLE_ID_USER = 3; 

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
      return NextResponse.json({ success: false, message: 'User with this email already exists.' }, { status: 409 });
    }

    // 3. Hash the password
    const hashedPassword = await hashPassword(password);

    // 4. Create the new user
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, ROLE_ID_USER]
    );

    const newUserId = result.insertId;

    if (!newUserId) {
        throw new Error('Failed to create user.');
    }

    // 5. Assign default role to the new user in user_roles table
    await connection.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [newUserId, ROLE_ID_USER]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'User registered successfully!',
      user: { id: newUserId, name, email, role: 'user' } // Do NOT return the password
    }, { status: 201 });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred during registration.'
    }, { status: 500 });
  } finally {
      if (connection) {
          connection.release();
      }
  }
}
