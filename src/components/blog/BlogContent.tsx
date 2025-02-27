
import { BlogPost } from "@/types/blog";

interface BlogContentProps {
  post: BlogPost;
}

export function BlogContent({ post }: BlogContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
      <div className="flex flex-wrap gap-2 mt-8">
        {post.tags.map((tag, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
