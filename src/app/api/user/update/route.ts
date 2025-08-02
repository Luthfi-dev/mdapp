
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getAuthFromRequest } from '@/lib/auth-utils';
import type { ResultSetHeader } from 'mysql2';
import { encrypt, decrypt } from '@/lib/encryption';

const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama harus memiliki setidaknya 3 karakter.").optional(),
  phone: z.string().optional(), // Can be empty string or undefined
  avatar_url: z.string().optional(),
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
    
    // --- Dynamic SQL Query Builder ---
    const fieldsToUpdate: { [key: string]: any } = {};
    const queryParams: any[] = [];
    
    if (name !== undefined) {
      fieldsToUpdate.name = name;
    }
    if (phone !== undefined) {
      // Encrypt phone number only if it's a non-empty string
      fieldsToUpdate.phone_number = phone ? encrypt(phone) : null;
    }
    if (avatar_url !== undefined) {
      fieldsToUpdate.avatar_url = avatar_url;
    }
    
    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json({ success: false, message: 'Tidak ada data untuk diperbarui.' }, { status: 400 });
    }
    
    const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE users SET ${setClauses} WHERE id = ?`;
    
    const finalQueryParams = [...Object.values(fieldsToUpdate), user.id];

    connection = await db.getConnection();
    const [result] = await connection.execute<ResultSetHeader>(sql, finalQueryParams);

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

    const updatedUserDb = rows[0];
    const decryptedPhone = updatedUserDb.phone_number ? decrypt(updatedUserDb.phone_number) : undefined;

    const updatedUserForToken = {
        id: updatedUserDb.id,
        name: updatedUserDb.name,
        email: updatedUserDb.email,
        role: updatedUserDb.role_id,
        avatar: updatedUserDb.avatar_url,
        phone: decryptedPhone,
        points: updatedUserDb.points,
        referralCode: updatedUserDb.referral_code
    };

    return NextResponse.json({ 
        success: true, 
        message: 'Profil berhasil diperbarui.',
        user: updatedUserForToken
    });

  } catch (error) {
    console.error('Update profile error:', error);
    const message = error instanceof Error ? `Server Error: ${error.message}` : 'Terjadi kesalahan server yang tidak diketahui.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
