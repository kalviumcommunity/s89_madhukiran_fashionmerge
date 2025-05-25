import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { usePollsStore } from '../../pages/pollsStore';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';
import './CommentModal.css';

const CommentModal = ({ poll: initialPoll, onClose }) => {
  console.log('CommentModal rendered with poll:', initialPoll?._id);
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { fetchPoll, commentPoll, isLoading } = usePollsStore();
  const commentInputRef = useRef(null);

  // State
  const [poll, setPoll] = useState(initialPoll);
  const [comment, setComment] = useState('');
  const [likedComments, setLikedComments] = useState({});

  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  // Fetch poll details
  useEffect(() => {
    if (token && poll._id) {
      fetchPoll(poll._id, token)
        .then(fetchedPoll => {
          if (fetchedPoll) {
            setPoll(fetchedPoll);
          }
        })
        .catch(error => {
          console.error('Error fetching poll details:', error);
        });
    }
  }, [token, poll._id, fetchPoll]);

  // Set up socket event listeners
  useEffect(() => {
    if (socket) {
      // Listen for new comments
      const handleCommentUpdate = (data) => {
        if (data.pollId === poll._id) {
          setPoll(prevPoll => ({
            ...prevPoll,
            comments: [...prevPoll.comments, data.comment]
          }));
        }
      };

      socket.on('poll_comment', handleCommentUpdate);

      // Clean up listeners on unmount
      return () => {
        socket.off('poll_comment');
      };
    }
  }, [socket, poll._id]);

  // Auto-resize function
  const autoResize = (textarea) => {
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate the new height
      const newHeight = Math.max(36, Math.min(120, textarea.scrollHeight));

      // Set the new height
      textarea.style.height = newHeight + 'px';
    }
  };

  // Focus on comment input when modal opens and handle keyboard events
  useEffect(() => {
    const textareaRef = commentInputRef.current;

    if (textareaRef) {
      // Focus on the textarea
      setTimeout(() => {
        textareaRef.focus();
      }, 100);

      // Initialize height
      textareaRef.style.height = '36px';
    }

    // Handle escape key to close modal
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.warning(t('polls.errors.commentEmpty'));
      return;
    }

    try {
      await commentPoll(poll._id, comment, token);

      // Emit socket event
      if (socket) {
        socket.emit('comment', {
          pollId: poll._id,
          comment: comment,
          userId,
          username: username || 'User' // Use the current user's username
        });
      }

      // Clear comment input
      setComment('');

      // Reset textarea height to default
      if (commentInputRef.current) {
        commentInputRef.current.style.height = '36px';
        commentInputRef.current.focus();
      }

      toast.success(t('polls.commentSuccess'));
    } catch (error) {
      toast.error(t('polls.errors.commentFailed'));
      console.error('Error commenting on poll:', error);
    }
  };

  // Handle click outside to close modal
  const handleOverlayClick = (e) => {
    e.stopPropagation();
    if (e.target.className === 'comment-modal-overlay') {
      console.log('Overlay click detected');
      onClose();
    }
  };

  // Handle like action
  const handleLike = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const modalContent = (
    <div className="comment-modal-overlay" onClick={handleOverlayClick}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h2>{t('polls.tabs.comments')}</h2>
          <button
            className="comment-modal-close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Close button clicked');
              onClose();
            }}
          >
            ×
          </button>
        </div>

        <div className="comment-modal-content">
          <div className="poll-info">
            <h3>{poll.title}</h3>
            <div className="poll-creator">
              <span>{t('polls.createdBy')} {poll.creatorUsername}</span>
              <span className="poll-date">{formatDate(poll.createdAt)}</span>
            </div>
          </div>

          <div className="comment-section">
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                ref={commentInputRef}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  // Auto-resize the textarea
                  autoResize(e.target);
                }}
                placeholder={t('polls.commentPlaceholder')}
                rows={1}
                required
              />
              <button
                type="submit"
                disabled={isLoading || !comment.trim()}
              >
                {isLoading ? "..." : t('polls.post')}
              </button>
            </form>

            <div className="comments-list">
              {poll.comments.length === 0 ? (
                <div className="no-comments">
                  <p>{t('polls.noComments')}</p>
                </div>
              ) : (
                poll.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-header">
                      <span className="comment-username">
                        {comment.username || comment.userId?.username || 'Anonymous'}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.timestamp)}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-actions">
                      <span
                        className={`comment-like ${likedComments[index] ? 'liked' : ''}`}
                        onClick={() => handleLike(index)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={likedComments[index] ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span className="like-text">{t('polls.like')}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal outside the normal DOM hierarchy
  return createPortal(modalContent, document.body);
};

export default CommentModal;
