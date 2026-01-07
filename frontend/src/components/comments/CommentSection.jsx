import { useState } from 'react';
import { commentsAPI, getErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { User, Trash2, MessageCircle, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const CommentSection = ({ postId, comments, onCommentAdded, onCommentDeleted }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (newComment.length > 2000) {
      toast.error('Comment must be less than 2000 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await commentsAPI.create(postId, newComment.trim());
      onCommentAdded(response.data);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      console.error('Error posting comment:', err);
      const message = getErrorMessage(err);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingId(commentId);
    try {
      await commentsAPI.delete(commentId);
      onCommentDeleted(commentId);
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (comment) => {
    if (!user) return false;
    return user.is_admin || comment.author_id === user.id;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    // Less than 24 hours
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    // Less than 7 days
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    // Older
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mt-8">
      <h2 className="font-primary font-bold text-xl mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-pp-magenta" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {user ? (
        <Card className="p-4 mb-6 bg-white rounded-xl border-2 border-gray-200">
          <form onSubmit={handleSubmit}>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="mb-3 resize-none border-gray-300 focus:border-pp-magenta focus:ring-pp-magenta"
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {newComment.length}/2000
              </span>
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="rounded-full bg-pp-magenta hover:bg-pp-magenta/90"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 mb-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
          <LogIn className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-3">Log in to join the conversation</p>
          <Link to="/login">
            <Button variant="outline" className="rounded-full">
              Log In to Comment
            </Button>
          </Link>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card
              key={comment.id}
              className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-pp-lavender flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-pp-magenta" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-primary font-semibold text-sm">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                    {canDelete(comment) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                    {comment.body}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
