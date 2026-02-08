import { supabase } from '../lib/supabase';
import type { Comment, CommentFormData } from '../types';

export async function getComments(blogId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addComment(
  blogId: string,
  formData: CommentFormData
): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        blog_id: blogId,
        user_id: user.id,
        content: formData.content,
        image_url: formData.image_url ?? null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
