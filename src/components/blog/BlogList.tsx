
import { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";

interface BlogListProps {
  posts: BlogPost[];
  title?: string;
}

export function BlogList({ posts, title }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-gray-600">No posts found</h2>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
