
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth-utils';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

export async function POST(request: Request) {
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

    // 2. Check if user already exists (Placeholder)
    // In a real app, you would query your database here
    // Example: const existingUser = await db.user.findUnique({ where: { email } });
    // if (existingUser) {
    //   return NextResponse.json({ success: false, message: 'User with this email already exists.' }, { status: 409 });
    // }

    // 3. Hash the password
    const hashedPassword = await hashPassword(password);

    // 4. Create the new user (Placeholder)
    // In a real app, you would save the new user to your database here
    // Example: const newUser = await db.user.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //     role: 'user' // Default role
    //   }
    // });
    
    console.log('--- New User Registration ---');
    console.log('Email:', email);
    console.log('Hashed Password:', hashedPassword);
    console.log('This is where you would save the user to the database.');
    console.log('----------------------------');


    return NextResponse.json({
      success: true,
      message: 'User registered successfully!',
      user: { name, email, role: 'user' } // Do NOT return the password
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
