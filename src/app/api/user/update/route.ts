
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getAuthFromRequest } from '@/lib/auth-utils';
import type { ResultSetHeader } from 'mysql2';
import { encrypt, decrypt } from '@/lib/encryption';

// Schema is now more robust, explicitly marking fields as optional.
const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama harus memiliki setidaknya 3 karakter.").optional(),
  phone: z.string().optional(), // Can be an empty string, null, or undefined
  avatar_url: z.string().nullable().optional(), // Can be a string, null, or undefined
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
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      queryParams.push(name);
    }
    if (phone !== undefined) {
      // Encrypt phone number only if it's a non-empty string, otherwise store as NULL
      updateFields.push('phone_number = ?');
      queryParams.push(phone ? encrypt(phone) : null);
    }
    if (avatar_url !== undefined) {
      // avatar_url can be a string path or null to clear it
      updateFields.push('avatar_url = ?');
      queryParams.push(avatar_url);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ success: true, message: 'Tidak ada data untuk diperbarui.', user });
    }
    
    const setClause = updateFields.join(', ');
    const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
    
    // Add the user ID as the last parameter for the WHERE clause
    queryParams.push(user.id);

    connection = await db.getConnection();
    const [result] = await connection.execute<ResultSetHeader>(sql, queryParams);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Gagal memperbarui profil, pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Fetch the updated user data to return, ensuring data consistency
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
