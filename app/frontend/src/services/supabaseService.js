import { supabase } from '../lib/supabase';

/**
 * Profiles
 */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Documents
 */
export const getDocuments = async (userId) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const uploadDocument = async (userId, file) => {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${userId}/${fileName}`;

  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Insert into documents table
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert([{
      user_id: userId,
      file_name: file.name,
      storage_path: filePath,
      status: 'pending'
    }])
    .select()
    .single();

  if (dbError) throw dbError;
  return data;
};

export const deleteDocument = async (documentId, storagePath) => {
  // 1. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([storagePath]);

  if (storageError) throw storageError;

  // 2. Delete from DB
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (dbError) throw dbError;
  return true;
};
