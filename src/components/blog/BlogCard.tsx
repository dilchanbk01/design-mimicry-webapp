
import { BlogPost } from "@/types/blog";
import { useNavigate } from "react-router-dom";
import { formatDistance } from "date-fns";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/blog/${post.slug}`);
  };
  
  // Format date to "X days/months ago"
  const formattedDate = formatDistance(
    new Date(post.publishedDate),
    new Date(),
    { addSuffix: true }
  );
  
  if (featured) {
    return (
      <div 
        onClick={handleClick}
        className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
      >
        <div className="relative h-64 w-full">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 bg-accent text-white px-4 py-1 text-xs uppercase">
            {post.category}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-accent transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-4">{post.excerpt}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{formattedDate}</span>
            <span className="text-sm text-accent font-medium">Read More →</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48">
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 bg-accent text-white px-3 py-1 text-xs uppercase">
          {post.category}
        </div>
      </div>
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xs text-gray-500">{formattedDate}</span>
          <span className="text-sm text-accent font-medium">Read More →</span>
        </div>
      </div>
    </div>
  );
}
