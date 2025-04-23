import { supabase } from './supabaseService';

const bucket = process.env.SUPABASE_BUCKET!;

export async function uploadFile(path: string, fileBuffer: Buffer, contentType: string) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, fileBuffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  return data;
}

export async function getFileUrl(path: string) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60); // 1h
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
