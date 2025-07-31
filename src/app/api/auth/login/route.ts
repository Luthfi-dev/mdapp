
import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth-utils';
import { z } from 'zod';
import { db } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();

    // 1. Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: validationResult.error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    // 2. Find the user in the database
    connection = await db.getConnection();
    const [rows]: [any[], any] = await connection.execute(
      'SELECT id, name, email, password as passwordHash, role_id FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    const user = rows[0];

    // 3. Verify the password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    // 4. Create a session/token (Placeholder for JWT or session logic)
    // For now, we just return user data.
    console.log('--- User Login Successful ---');
    console.log('User:', user.email);
    console.log('This is where you would create a JWT or session.');
    console.log('----------------------------');


    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      // Do NOT return the password hash
      user: { name: user.name, email: user.email, role_id: user.role_id } 
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  } finally {
    if (connection) {
        connection.release();
    }
  }
}
