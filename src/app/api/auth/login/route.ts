
import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth-utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export async function POST(request: Request) {
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

    // 2. Find the user (Placeholder)
    // In a real app, you would query your database for the user by email
    // Example: const user = await db.user.findUnique({ where: { email } });
    
    // --- Mock User Data (Remove in production) ---
    const MOCK_USER_HASH = '$2a$10$TjG0pXvG6S0mF0s2n3J5X.z/d2L4f8h9j1k0s5m2f7g1h8i3j6k'; // A bcrypt hash for "password123"
    const user = {
        email: 'user@example.com',
        passwordHash: MOCK_USER_HASH,
        name: 'John Doe',
        role: 'user'
    };
    // --- End Mock User Data ---
    
    if (!user) {
        return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    // 3. Verify the password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
        return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }
    
    // 4. Create a session/token (Placeholder)
    // Here you would typically generate a JWT or create a session cookie.
    // This token would be sent back to the client to be used for authenticated requests.
    console.log('--- User Login Successful ---');
    console.log('User:', user.email);
    console.log('This is where you would create a JWT or session.');
    console.log('----------------------------');


    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: { name: user.name, email: user.email, role: user.role } // Do NOT return the password hash
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
