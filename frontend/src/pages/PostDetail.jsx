import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsAPI, commentsAPI, DEFAULT_POST_IMAGE, FEATURES } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, Calendar, User, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import CommentSection from '../components/comments/CommentSection';

// Helper to get post image URL with fallback
const getPostImageUrl = (imageUrl) => {
  if (!imageUrl) return DEFAULT_POST_IMAGE;
  if (imageUrl.startsWith('/api/uploads/') && process.env.REACT_APP_BACKEND_URL) {
    return `${process.env.REACT_APP_BACKEND_URL}${imageUrl}`;
  }
  return imageUrl;
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Paperboy Prince`;
    }
    return () => {
      document.title = 'Paperboy Prince';
    };
  }, [post]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const postRes = await postsAPI.getOne(id);
      const postData = postRes.data;
      
      if (!postData || (postData.status && postData.status !== 'approved')) {
        toast.error('Post not found');
        navigate('/posts');
        return;
      }
      
      setPost(postData);
      
      // Load comments only if backend is available
      if (FEATURES.COMMENTS_ENABLED) {
        try {
          const commentsRes = await commentsAPI.getForPost(id);
          setComments(commentsRes.data || []);
        } catch {
          setComments([]);
        }
      }
    } catch (err) {
      console.warn('Error loading post:', err.message);
      toast.error('Post not found');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prev => [...prev, newComment]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <img
          src={getPostImageUrl(post.image_url)}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_POST_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link to="/posts">
            <Button variant="secondary" className="rounded-full bg-white/90 hover:bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Posts
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-primary font-bold text-3xl md:text-4xl mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author_name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {FEATURES.COMMENTS_ENABLED && (
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </span>
              )}
              
              {/* Share button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 text-gray-500 hover:text-pp-magenta"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share'}
              </Button>
            </div>
          </header>

          {/* Post Body - Markdown Rendered */}
          <div className="prose prose-lg max-w-none prose-headings:font-primary prose-p:text-gray-700 prose-a:text-pp-magenta prose-strong:text-gray-900">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-pp-magenta hover:underline">
                    {children}
                  </a>
                ),
                code: ({ inline, children }) => (
                  inline 
                    ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>
                    : <code className="block bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{children}</code>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Comments Section - Only show if backend available */}
        {FEATURES.COMMENTS_ENABLED && (
          <CommentSection
            postId={post.id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        )}
      </article>

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
};

export default PostDetail;
