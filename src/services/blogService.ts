import { supabase } from '../lib/supabase';
import type { Blog, BlogFormData } from '../types';

// Get all blogs with pagination
export const getBlogs = async (page: number = 1, pageSize: number = 10) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get total count
  const { count } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true });

  // Get blogs for current page
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    blogs: data || [],
    totalCount: count || 0,
  };
};

// Get a single blog by ID
export const getBlogById = async (id: string): Promise<Blog> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create a new blog
export const createBlog = async (blogData: BlogFormData): Promise<Blog> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const row: Record<string, unknown> = {
    title: blogData.title,
    content: blogData.content,
    user_id: user.id,
  };
  if (blogData.image_url != null && blogData.image_url !== '') {
    row.image_url = blogData.image_url;
  }

  const { data, error } = await supabase
    .from('blogs')
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a blog
export const updateBlog = async (
  id: string,
  blogData: BlogFormData
): Promise<Blog> => {
  const { data, error } = await supabase
    .from('blogs')
    .update({
      title: blogData.title,
      content: blogData.content,
      image_url: blogData.image_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a blog
export const deleteBlog = async (id: string): Promise<void> => {
  const { error } = await supabase.from('blogs').delete().eq('id', id);

  if (error) throw error;
};
