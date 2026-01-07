import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postsAPI, DEFAULT_POST_IMAGE, FEATURES } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, FileText, MessageCircle, Calendar, User } from 'lucide-react';

// Helper to get post image URL with fallback
const getPostImageUrl = (imageUrl) => {
  if (!imageUrl) return DEFAULT_POST_IMAGE;
  if (imageUrl.startsWith('/api/uploads/') && process.env.REACT_APP_BACKEND_URL) {
    return `${process.env.REACT_APP_BACKEND_URL}${imageUrl}`;
  }
  return imageUrl;
};

const Posts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'newest');
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    total: 0
  });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 12,
        sort: sortOrder
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await postsAPI.getAll(params);
      const data = response.data;
      
      // Handle both array and object response formats
      if (Array.isArray(data)) {
        setPosts(data);
        setPagination(prev => ({ ...prev, totalPages: 1, total: data.length }));
      } else {
        setPosts(data.posts || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.total_pages || 1,
          total: data.total || 0
        }));
      }
    } catch (err) {
      console.warn('Using static content:', err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, sortOrder, searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (sortOrder !== 'newest') params.set('sort', sortOrder);
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    setSearchParams(params, { replace: true });
  }, [searchQuery, sortOrder, pagination.page, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pp-magenta py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-campaign text-4xl md:text-5xl text-white tracking-wider text-center">
            POSTS LIBRARY
          </h1>
          <p className="text-white/80 text-center mt-2 font-primary">
            Browse all community updates and stories
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-gray-300"
              />
            </div>
            <Button type="submit" variant="outline" className="rounded-full">
              Search
            </Button>
          </form>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={toggleSort}
              className="flex items-center gap-2 text-gray-600"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          {pagination.total} {pagination.total === 1 ? 'post' : 'posts'} found
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-2xl border-2 border-gray-200 overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-primary font-bold text-xl text-gray-700 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Check back later for new content'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const PostWrapper = FEATURES.DYNAMIC_POSTS ? Link : 'div';
              const wrapperProps = FEATURES.DYNAMIC_POSTS ? { to: `/posts/${post.id}` } : {};
              
              return (
                <PostWrapper key={post.id} {...wrapperProps}>
                  <Card className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-pp-magenta hover:shadow-lg transition-all duration-300 h-full group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getPostImageUrl(post.image_url)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_POST_IMAGE;
                        }}
                      />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-primary font-bold text-lg mb-2 line-clamp-2 group-hover:text-pp-magenta transition-colors">
                        {post.title}
                      </h3>
                      <p className="font-primary text-gray-600 text-sm line-clamp-3 mb-4">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {FEATURES.COMMENTS_ENABLED && post.comment_count > 0 && (
                          <span className="flex items-center gap-1 text-pp-magenta">
                            <MessageCircle className="w-3 h-3" />
                            {post.comment_count}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </PostWrapper>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'ghost'}
                    onClick={() => goToPage(pageNum)}
                    className={`w-10 h-10 rounded-full ${pagination.page === pageNum ? 'bg-pp-magenta hover:bg-pp-magenta/90' : ''}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
