
import { useNavigate } from "react-router-dom";
import { BlogPost, BlogCategory } from "@/types/blog";

interface BlogSidebarProps {
  recentPosts: BlogPost[];
  categories: BlogCategory[];
  popularTags?: string[];
}

export function BlogSidebar({ recentPosts, categories, popularTags = [] }: BlogSidebarProps) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      {/* Recent Posts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Recent Posts</h3>
        <ul className="space-y-4">
          {recentPosts.map(post => (
            <li key={post.id} className="flex gap-3">
              <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h4 
                  className="text-sm font-medium hover:text-accent cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  {post.title}
                </h4>
                <span className="text-xs text-gray-500">{new Date(post.publishedDate).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Categories</h3>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.id}>
              <button 
                className="text-gray-600 hover:text-accent transition-colors"
                onClick={() => navigate(`/blog/category/${category.slug}`)}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-accent hover:text-white transition-colors cursor-pointer"
                onClick={() => navigate(`/blog/tag/${tag}`)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
