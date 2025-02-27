
import { useState, useEffect } from "react";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogList } from "@/components/blog/BlogList";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts, getBlogCategories, getRecentPosts } from "@/data/blogPosts";
import type { BlogPost } from "@/types/blog";

export default function Blog() {
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const categories = getBlogCategories();
  const recentPosts = getRecentPosts(3);
  
  // Popular tags based on frequency in blog posts
  const popularTags = Array.from(
    new Set(blogPosts.flatMap(post => post.tags).slice(0, 10))
  );
  
  useEffect(() => {
    // Get most recent post as featured post
    const sortedPosts = [...blogPosts].sort(
      (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
    
    if (sortedPosts.length > 0) {
      setFeaturedPost(sortedPosts[0]);
      setPosts(sortedPosts.slice(1));
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Post</h2>
            <BlogCard post={featuredPost} featured />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <BlogList posts={posts} title="Latest Posts" />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar 
              recentPosts={recentPosts}
              categories={categories}
              popularTags={popularTags}
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-8 border-t">
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
