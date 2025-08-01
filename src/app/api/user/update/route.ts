
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getAuthFromRequest } from '@/lib/auth-utils';
import type { ResultSetHeader } from 'mysql2';
import { encrypt, decrypt } from '@/lib/encryption';

const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama harus memiliki setidaknya 3 karakter."),
  phone: z.string().optional().or(z.literal('')),
  avatar_url: z.string().optional().or(z.literal('')).nullable(), 
});

export async function POST(request: Request) {
  let connection;
  try {
    const user = await getAuthFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Tidak terotentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: validation.error.errors.map(e => e.message).join(', ') 
      }, { status: 400 });
    }

    const { name, phone, avatar_url } = validation.data;
    const encryptedPhone = phone ? encrypt(phone) : null;

    connection = await db.getConnection();
    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE users SET name = ?, phone_number = ?, avatar_url = ? WHERE id = ?',
      [name, encryptedPhone, avatar_url || null, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Gagal memperbarui profil, pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Fetch the updated user data to return
    const [rows]: [any[], any] = await connection.execute(
      'SELECT id, name, email, role_id, status, avatar_url, phone_number, points, referral_code FROM users WHERE id = ?',
      [user.id]
    );

    if (rows.length === 0) {
        return NextResponse.json({ success: false, message: 'Gagal mengambil data pengguna yang diperbarui.' }, { status: 500 });
    }

    const updatedUser = rows[0];
    const decryptedPhone = updatedUser.phone_number ? decrypt(updatedUser.phone_number) : undefined;

    const userForToken = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role_id,
        avatar: updatedUser.avatar_url,
        phone: decryptedPhone,
        points: updatedUser.points,
        referralCode: updatedUser.referral_code
    };

    return NextResponse.json({ 
        success: true, 
        message: 'Profil berhasil diperbarui.',
        user: userForToken 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
