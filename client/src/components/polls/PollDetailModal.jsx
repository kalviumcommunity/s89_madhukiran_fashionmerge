import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePollsStore } from '../../pages/pollsStore';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';
import './PollDetailModal.css';

const PollDetailModal = ({ poll: initialPoll, onClose }) => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { fetchPoll, votePoll, commentPoll, deletePoll, isLoading } = usePollsStore();

  // State
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOption, setSelectedOption] = useState(null);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('vote');

  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Check if user is the creator
  const isCreator = userId && poll.creator && userId === poll.creator.toString();

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
      // Listen for poll updates
      const handlePollUpdate = (data) => {
        if (data.pollId === poll._id) {
          // Update poll with new data
          setPoll(prevPoll => ({
            ...prevPoll,
            options: data.options.map((updatedOption, index) => ({
              ...prevPoll.options[index],
              votes: Array(updatedOption.voteCount).fill({ userId: 'unknown' })
            }))
          }));
        }
      };

      // Listen for new comments
      const handleCommentUpdate = (data) => {
        if (data.pollId === poll._id) {
          setPoll(prevPoll => ({
            ...prevPoll,
            comments: [...prevPoll.comments, data.comment]
          }));
        }
      };

      socket.on('poll_update', handlePollUpdate);
      socket.on('poll_comment', handleCommentUpdate);

      return () => {
        socket.off('poll_update', handlePollUpdate);
        socket.off('poll_comment', handleCommentUpdate);
      };
    }
  }, [socket, poll._id]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user has voted
  const hasVoted = poll.options.some(option =>
    option.votes.some(vote => vote.userId === userId)
  );

  // Get total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  // Handle option selection
  const handleOptionSelect = (index) => {
    if (hasVoted) return;
    setSelectedOption(index);
  };

  // Handle vote submission
  const handleVote = async () => {
    if (selectedOption === null) {
      toast.warning(t('polls.errors.selectOption'));
      return;
    }

    try {
      const updatedPoll = await votePoll(poll._id, selectedOption, token);
      setPoll(updatedPoll);

      // Emit socket event
      if (socket) {
        socket.emit('vote', {
          pollId: poll._id,
          optionIndex: selectedOption,
          userId
        });
      }

      toast.success(t('polls.voteSuccess'));
    } catch (error) {
      toast.error(t('polls.errors.voteFailed'));
      console.error('Error voting on poll:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.warning(t('polls.errors.commentEmpty'));
      return;
    }

    try {
      const newComment = await commentPoll(poll._id, comment, token);

      // Emit socket event
      if (socket) {
        socket.emit('comment', {
          pollId: poll._id,
          comment: comment,
          userId,
          username: poll.creatorUsername // This should be the current user's username
        });
      }

      // Clear comment input
      setComment('');

      toast.success(t('polls.commentSuccess'));
    } catch (error) {
      toast.error(t('polls.errors.commentFailed'));
      console.error('Error commenting on poll:', error);
    }
  };

  // Calculate percentage for option
  const calculatePercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes.length / totalVotes) * 100);
  };

  // Handle poll deletion
  const handleDelete = async () => {
    if (!confirm(t('polls.confirmDelete'))) return;

    try {
      await deletePoll(poll._id, token);

      toast.success(t('polls.deleteSuccess'));
      onClose();
    } catch (error) {
      toast.error(t('polls.errors.deleteFailed'));
      console.error('Error deleting poll:', error);
    }
  };

  return (
    <div className="poll-detail-modal-overlay">
      <div className="poll-detail-modal">
        <div className="poll-detail-modal-header">
          <h2>{poll.title}</h2>
          <div className="poll-detail-modal-actions">
            {isCreator && (
              <button
                className="poll-detail-modal-delete"
                onClick={handleDelete}
                title={t('polls.delete')}
              >
                {t('polls.delete')}
              </button>
            )}
            <button
              className="poll-detail-modal-close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="poll-detail-content">
          <div className="poll-detail-info">
            <div className="poll-detail-creator">
              <span>{t('polls.createdBy')} {poll.creatorUsername}</span>
              <span className="poll-detail-date">{formatDate(poll.createdAt)}</span>
            </div>

            {poll.description && (
              <p className="poll-detail-description">{poll.description}</p>
            )}

            <div className="poll-detail-stats">
              <span>{totalVotes} {totalVotes === 1 ? t('polls.vote') : t('polls.votes')}</span>
              <span>{poll.comments.length} {poll.comments.length === 1 ? t('polls.comment') : t('polls.comments')}</span>
              <span className="poll-detail-category">{t(`polls.categories.${poll.category}`)}</span>
            </div>
          </div>

          <div className="poll-detail-tabs">
            <button
              className={`poll-tab ${activeTab === 'vote' ? 'active' : ''}`}
              onClick={() => setActiveTab('vote')}
            >
              {t('polls.tabs.vote')}
            </button>
            <button
              className={`poll-tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              {t('polls.tabs.comments')} ({poll.comments.length})
            </button>
          </div>

          {activeTab === 'vote' && (
            <div className="poll-vote-section">
              <div className="poll-options">
                {poll.options.map((option, index) => (
                  <div
                    key={index}
                    className={`poll-option ${hasVoted ? 'voted' : ''} ${selectedOption === index ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    {poll.type === 'visual' && option.imageUrl && (
                      <div className="poll-option-image-container">
                        <img
                          src={option.imageUrl}
                          alt={option.content}
                          className="poll-option-image"
                        />
                      </div>
                    )}

                    <div className="poll-option-content">
                      <span className="poll-option-text">{option.content}</span>

                      {hasVoted && (
                        <div className="poll-option-results">
                          <div
                            className="poll-option-progress"
                            style={{ width: `${calculatePercentage(option.votes)}%` }}
                          />
                          <span className="poll-option-percentage">
                            {calculatePercentage(option.votes)}%
                          </span>
                          <span className="poll-option-votes">
                            ({option.votes.length})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!hasVoted && (
                <button
                  className="poll-vote-button"
                  onClick={handleVote}
                  disabled={selectedOption === null || isLoading}
                >
                  {isLoading ? t('common.submitting') : t('polls.submitVote')}
                </button>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="poll-comments-section">
              <form onSubmit={handleCommentSubmit} className="poll-comment-form">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('polls.commentPlaceholder')}
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !comment.trim()}
                >
                  {isLoading ? t('common.submitting') : t('polls.addComment')}
                </button>
              </form>

              <div className="poll-comments-list">
                {poll.comments.length === 0 ? (
                  <div className="poll-no-comments">
                    <p>{t('polls.noComments')}</p>
                  </div>
                ) : (
                  poll.comments.map((comment, index) => (
                    <div key={index} className="poll-comment">
                      <div className="poll-comment-header">
                        <span className="poll-comment-username">
                          {comment.username || comment.userId?.username || 'Anonymous'}
                        </span>
                        <span className="poll-comment-date">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="poll-comment-content">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetailModal;
