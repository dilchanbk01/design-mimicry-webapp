
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogList } from "@/components/blog/BlogList";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { getPostsByCategory, getBlogCategories, getRecentPosts } from "@/data/blogPosts";
import type { BlogPost } from "@/types/blog";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const categories = getBlogCategories();
  const recentPosts = getRecentPosts(3);
  
  useEffect(() => {
    if (category) {
      const categoryPosts = getPostsByCategory(category);
      setPosts(categoryPosts);
      
      // Get category display name
      const categoryObj = categories.find(cat => cat.slug === category);
      setCategoryName(categoryObj ? categoryObj.name : category);
      
      if (categoryPosts.length === 0 && !categories.some(cat => cat.slug === category)) {
        // Category doesn't exist
        navigate("/blog", { replace: true });
      }
    }
  }, [category, categories, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{categoryName} Articles</h1>
          <p className="text-gray-600">Explore our collection of articles about {categoryName.toLowerCase()}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <BlogList posts={posts} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <BlogSidebar 
                recentPosts={recentPosts}
                categories={categories}
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
