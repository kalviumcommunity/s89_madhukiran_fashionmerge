import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePollsStore } from '../../pages/pollsStore';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { useModal } from './GlobalModalProvider';
import './PollCard.css';

const PollCard = ({ poll, onClick }) => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { votePoll, deletePoll } = usePollsStore();
  const { openModal } = useModal();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVoting, setIsVoting] = useState(false);

  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  // Determine if poll is visual or text
  const isVisual = poll.type === 'visual';

  // Get first image for visual polls
  const firstImage = isVisual && poll.options.length > 0 ? poll.options[0].imageUrl : null;

  // Check if user is the creator
  const isCreator = userId && poll.creator && userId === poll.creator.toString();

  // Check if user has already voted
  const hasVoted = poll.options.some(option =>
    option.votes.some(vote => vote.userId === userId)
  );

  // Handle option selection for text polls
  const handleOptionSelect = (e, index) => {
    e.stopPropagation();
    if (hasVoted || isVoting) return;
    setSelectedOption(index);
  };

  // Handle vote submission for text polls
  const handleVote = async (e) => {
    e.stopPropagation();
    if (selectedOption === null || hasVoted || isVoting) return;

    setIsVoting(true);

    try {
      await votePoll(poll._id, selectedOption, token);

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
    } finally {
      setIsVoting(false);
      setSelectedOption(null);
    }
  };

  // Handle poll deletion
  const handleDelete = async (e) => {
    e.stopPropagation();

    if (!confirm(t('polls.confirmDelete'))) return;

    try {
      await deletePoll(poll._id, token);

      toast.success(t('polls.deleteSuccess'));
    } catch (error) {
      toast.error(t('polls.errors.deleteFailed'));
      console.error('Error deleting poll:', error);
    }
  };

  // Calculate percentage for option
  const calculatePercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes.length / totalVotes) * 100);
  };

  // Handle card click
  const handleCardClick = () => {
    // For visual polls, open the modal
    if (isVisual) {
      onClick();
    }
  };

  // Handle comment icon click
  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Comment click detected');

    // Open the comment modal using the global modal system
    openModal('comment', { poll });
  };

  return (
    <>
      <div className={`poll-card ${isVisual ? '' : 'text-poll'}`} onClick={handleCardClick}>
        <div className="poll-card-header">
          <div className="poll-card-creator">
            <span className="poll-card-username">{poll.creatorUsername}</span>
          </div>
          <div className="poll-card-actions">
            <span className="poll-card-date">{formatDate(poll.createdAt)}</span>
            {isCreator && (
              <button
                className="poll-card-delete-btn"
                onClick={handleDelete}
                title={t('polls.delete')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <h3 className="poll-card-title">{poll.title}</h3>

        {poll.description && (
          <p className="poll-card-description">
            {poll.description.length > 75
              ? `${poll.description.substring(0, 75)}...`
              : poll.description}
          </p>
        )}

        {isVisual && firstImage && (
          <div className="poll-card-image-container">
            <img
              src={firstImage}
              alt={poll.title}
              className="poll-card-image"
            />
            <div className="poll-card-image-overlay">
              <span>{poll.options.length} {t('polls.images')}</span>
            </div>
          </div>
        )}

        {!isVisual && (
          <div className="poll-card-options">
            {poll.options.map((option, index) => (
              <div
                key={index}
                className={`poll-card-option ${selectedOption === index ? 'selected' : ''} ${hasVoted ? 'voted' : ''}`}
                onClick={(e) => handleOptionSelect(e, index)}
              >
                {hasVoted && (
                  <div
                    className="poll-option-progress"
                    style={{ width: `${calculatePercentage(option.votes)}%` }}
                  />
                )}
                <div className="poll-option-content">
                  <span>{option.content}</span>
                </div>
              </div>
            ))}

            {!hasVoted && !isVisual && (
              <button
                className="poll-vote-button"
                onClick={handleVote}
                disabled={selectedOption === null || isVoting}
              >
                {isVoting ? t('common.submitting') : t('polls.submitVote')}
              </button>
            )}
          </div>
        )}

        <div className="poll-card-footer">
          <div className="poll-card-stats">
            <span className="poll-card-votes">
              {totalVotes} {totalVotes === 1 ? t('polls.vote') : t('polls.votes')}
            </span>
            <div className="poll-card-comments-wrapper">
              <button
                className="poll-card-comments"
                onClick={handleCommentClick}
                title={t('polls.viewComments')}
                type="button"
              >
                {poll.comments.length} {poll.comments.length === 1 ? t('polls.comment') : t('polls.comments')}
              </button>
            </div>
          </div>
          <div className="poll-card-category">
            {t(`polls.categories.${poll.category}`)}
          </div>
        </div>
      </div>
    </>
  );
};

export default PollCard;
