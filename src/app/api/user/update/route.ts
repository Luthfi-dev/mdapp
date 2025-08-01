
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getAuthFromRequest } from '@/lib/auth-utils';
import type { ResultSetHeader } from 'mysql2';

const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama harus memiliki setidaknya 3 karakter."),
  phone: z.string().optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')), // Avatar as data URI
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

    const { name, phone, avatar } = validation.data;

    connection = await db.getConnection();
    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE users SET name = ?, phone_number = ?, avatar = ? WHERE id = ?',
      [name, phone || null, avatar || null, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Gagal memperbarui profil, pengguna tidak ditemukan.' }, { status: 404 });
    }

    // After updating, we might want to return the updated user object or a new token
    // For simplicity, we just return success. The client should refresh its user state.
    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui.' });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
