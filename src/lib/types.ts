export interface Comment {
  id: string;
  name: string;
  text: string;
  date: string;
  userId: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
  tags?: string[];
  comments?: Record<string, Omit<Comment, 'id'>>;
  likes?: number;
}
