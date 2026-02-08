# Simple Blog Application

A clean and simple blog application built with React 19, TypeScript, Redux Toolkit, and Supabase.

## Features

- User Authentication (Register, Login, Logout)
- Blog CRUD Operations (Create, Read, Update, Delete)
- **Post images**: Add or remove an image when creating or editing a post
- **View page**: Click any post on the home list to open its full view
- **Comments with images**: Comment on posts (login required); comments can include an optional image
- Blog Listing with Pagination
- Responsive Design
- TypeScript for type safety
- Redux Toolkit for state management

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Redux Toolkit
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router DOM
- **Styling**: CSS Modules

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. In your Supabase project:
   - Go to Authentication > Settings
   - **Disable email confirmation** (important for easy testing)
3. Create the following tables in SQL Editor:

```sql
-- Blogs table
CREATE TABLE blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow authenticated users to read all blogs)
CREATE POLICY "Anyone can read blogs" ON blogs FOR SELECT USING (true);

-- Create policies (allow users to create their own blogs)
CREATE POLICY "Users can create their own blogs" ON blogs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies (allow users to update their own blogs)
CREATE POLICY "Users can update their own blogs" ON blogs FOR UPDATE USING (auth.uid() = user_id);

-- Create policies (allow users to delete their own blogs)
CREATE POLICY "Users can delete their own blogs" ON blogs FOR DELETE USING (auth.uid() = user_id);
```

4. Add image support to blogs and create comments table (run in SQL Editor):

```sql
-- Add image column to blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
```

5. Create a Storage bucket for images (in Supabase Dashboard → Storage):

- Create a bucket named **`uploads`**
- Set it to **Public** (so post and comment images can be displayed)
- In Storage → Policies, add a policy to allow authenticated uploads, e.g.:
  - **Policy name**: "Allow authenticated uploads"
  - **Allowed operation**: INSERT (and optionally UPDATE, DELETE)
  - **Target**: All objects in bucket `uploads`
  - **WITH CHECK**: `auth.role() = 'authenticated'`
- Add a policy for public read: **SELECT** for all users (or rely on public bucket read)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable components (Navbar, Layout, BlogCard, Pagination)
├── pages/           # Page components (Home, Login, Register, CreateBlog, etc.)
├── store/           # Redux store and slices
│   ├── store.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── blogSlice.ts
│       └── commentSlice.ts
├── services/        # API service functions
│   ├── authService.ts
│   ├── blogService.ts
│   ├── commentService.ts
│   └── storageService.ts
├── lib/             # External library configurations
│   └── supabase.ts
├── types/           # TypeScript type definitions
│   └── index.ts
└── App.tsx          # Main app component with routing
```

## Key Features Explained

### Authentication
- Users can register and login
- Email confirmation is disabled for easy testing
- Authentication state is managed by Redux
- Protected routes for blog creation and editing

### Blog Operations
- **Create**: Authenticated users can create new blogs (optional image)
- **Read**: All users can view blogs; clicking a card opens the full view page
- **Update**: Only blog owners can update their blogs (add/remove image)
- **Delete**: Only blog owners can delete their blogs
- **List**: Blogs are displayed with pagination (10 per page); cards show a thumbnail when the post has an image

### Comments
- **View**: All users can see comments on the blog view page
- **Add**: Logged-in users can post comments with optional image
- Comments are loaded with the blog and stored in Redux (comment slice)

### State Management
- Redux Toolkit is used for centralized state management
- Auth slice handles user authentication state
- Blog slice handles blog data and operations

## Notes for Interview

1. **Why Redux Toolkit?** Redux Toolkit simplifies Redux setup and reduces boilerplate code while maintaining all Redux benefits.

2. **Folder Structure**: Organized by feature/concern - components, pages, store, services are clearly separated.

3. **Authentication Flow**: Supabase handles authentication, Redux manages state, React Router handles navigation.

4. **Pagination**: Implemented using Supabase's `range()` function for efficient data fetching.

5. **Type Safety**: All components and functions are typed with TypeScript for better code quality and IDE support.