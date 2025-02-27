
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { BlogCard } from "@/components/blog/BlogCard";
import { getPostBySlug, getBlogCategories, getRecentPosts, getPostsByCategory } from "@/data/blogPosts";
import type { BlogPost } from "@/types/blog";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const categories = getBlogCategories();
  const recentPosts = getRecentPosts(3);
  
  useEffect(() => {
    if (slug) {
      const currentPost = getPostBySlug(slug);
      if (currentPost) {
        setPost(currentPost);
        
        // Get related posts from the same category
        const related = getPostsByCategory(currentPost.category)
          .filter(p => p.id !== currentPost.id)
          .slice(0, 3);
        setRelatedPosts(related);
      } else {
        // Handle post not found
        navigate("/blog", { replace: true });
      }
    }
  }, [slug, navigate]);
  
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlogHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Post Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            <div className="h-80 md:h-96 w-full relative">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 bg-accent text-white px-4 py-1 uppercase">
                {post.category}
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
              <p className="text-gray-600 text-lg mb-2">{post.excerpt}</p>
              <div className="text-sm text-gray-500">
                Published on {new Date(post.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <BlogContent post={post} />
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map(relatedPost => (
                    <BlogCard key={relatedPost.id} post={relatedPost} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <BlogSidebar 
                recentPosts={recentPosts}
                categories={categories}
                popularTags={post.tags}
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-8 border-t mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2024 Petsu Blog. All rights reserved.</p>
            <div className="flex justify-center space-x-4">
              <a href="/privacy-policy" className="text-sm hover:text-accent">Privacy Policy</a>
              <a href="/terms" className="text-sm hover:text-accent">Terms & Conditions</a>
              <a href="/" className="text-sm hover:text-accent">Back to Petsu</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
