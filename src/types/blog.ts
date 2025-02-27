
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  publishedDate: string;
  category: 'grooming' | 'events' | 'health' | 'training';
  tags: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}
