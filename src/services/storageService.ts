import { supabase } from '../lib/supabase';

const BLOG_BUCKET = 'uploads';
const BLOG_PREFIX = 'blog';
const COMMENT_PREFIX = 'comment';

function getExtension(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i >= 0 ? filename.slice(i).toLowerCase() : '.jpg';
}

export async function uploadBlogImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = getExtension(file.name);
  const path = `${BLOG_PREFIX}/${user.id}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(BLOG_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

export async function uploadCommentImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = getExtension(file.name);
  const path = `${COMMENT_PREFIX}/${user.id}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(BLOG_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}
