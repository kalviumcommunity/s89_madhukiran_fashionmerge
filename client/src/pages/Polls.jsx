import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { usePollsStore } from './pollsStore';
import { toast } from 'react-toastify';
import './Polls.css';
import CreatePollModal from '../components/polls/CreatePollModal';
import PollCard from '../components/polls/PollCard';
import PollFilters from '../components/polls/PollFilters';
import PollDetailModal from '../components/polls/PollDetailModal';
import NotificationBadge from '../components/polls/NotificationBadge';

const Polls = () => {
  const { t } = useTranslation();
  const { socket, connected } = useSocket();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Check if we have a pollId in the URL query params
  const queryParams = new URLSearchParams(location.search);
  const pollIdFromUrl = queryParams.get('pollId');

  // Get polls state and actions from store
  const {
    polls,
    isLoading,
    error,
    filters,
    pagination,
    notifications,
    fetchPolls,
    fetchNotifications,
    setFilters,
    updatePollInRealtime,
    addCommentInRealtime,
    addNotification,
    removePollFromState
  } = usePollsStore();

  // Fetch polls on component mount and when filters change
  useEffect(() => {
    if (token) {
      fetchPolls(token);
      fetchNotifications(token);
    }
  }, [token, fetchPolls, fetchNotifications, filters]);

  // Open poll detail modal if pollId is in URL
  useEffect(() => {
    if (pollIdFromUrl && polls.length > 0) {
      const pollToShow = polls.find(poll => poll._id === pollIdFromUrl);
      if (pollToShow) {
        setSelectedPoll(pollToShow);
        setShowDetailModal(true);
      }
    }
  }, [pollIdFromUrl, polls]);

  // Set up socket event listeners
  useEffect(() => {
    if (socket && connected) {
      // Listen for poll updates
      socket.on('poll_update', (data) => {
        updatePollInRealtime(data);
      });

      // Listen for new comments
      socket.on('poll_comment', (data) => {
        addCommentInRealtime(data);
      });

      // Listen for new notifications
      socket.on('notification', (data) => {
        addNotification(data);
        toast.info(`${data.senderUsername} ${data.type === 'poll_vote' ? 'voted on' : 'commented on'} a poll`);
      });

      // Listen for new polls
      socket.on('new_poll', (data) => {
        if (data.creatorId !== userId) {
          toast.info(`${data.creatorUsername} just posted a new poll: ${data.title}`);
          // Refresh polls to include the new one
          fetchPolls(token);
        }
      });

      // Listen for poll deletions
      socket.on('poll_deleted', (data) => {
        // Remove deleted poll from state
        removePollFromState(data.pollId);

        // Close detail modal if the deleted poll is currently open
        if (selectedPoll && selectedPoll._id === data.pollId) {
          setShowDetailModal(false);
          setSelectedPoll(null);
          toast.info('This poll has been deleted by its creator');
        }
      });

      // Clean up listeners on unmount
      return () => {
        socket.off('poll_update');
        socket.off('poll_comment');
        socket.off('notification');
        socket.off('new_poll');
        socket.off('poll_deleted');
      };
    }
  }, [socket, connected, userId, token, fetchPolls, updatePollInRealtime, addCommentInRealtime, addNotification, removePollFromState, selectedPoll]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // Handle poll click
  const handlePollClick = (poll) => {
    setSelectedPoll(poll);
    setShowDetailModal(true);
  };

  // Handle create poll button click
  const handleCreatePoll = () => {
    setShowCreateModal(true);
  };

  // Handle create poll modal close
  const handleCreateModalClose = () => {
    setShowCreateModal(false);
  };

  // Handle detail modal close
  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedPoll(null);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="polls-container">
      <div className="polls-header">
        <h1>
          <span className="polls-live-dot"></span>
          {t('polls.title')}
        </h1>
      </div>

      <div className="polls-controls">
        <PollFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <div className="polls-actions">
          <NotificationBadge count={unreadCount} />
          <button
            className="create-poll-button"
            onClick={handleCreatePoll}
          >
            CREATE POLL
          </button>
        </div>
      </div>

      {error && (
        <div className="polls-error">
          <p>{error}</p>
          <button onClick={() => fetchPolls(token)}>
            {t('common.tryAgain')}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="polls-loading">
          <p>{t('common.loading')}</p>
        </div>
      ) : (
        <>
          {polls.length === 0 ? (
            <div className="polls-empty">
              <p>{t('polls.noPolls')}</p>
              <button onClick={handleCreatePoll}>
                CREATE POLL
              </button>
            </div>
          ) : (
            <div className="polls-grid">
              {polls.map(poll => (
                <PollCard
                  key={poll._id}
                  poll={poll}
                  onClick={() => handlePollClick(poll)}
                />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="polls-pagination">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                {t('common.previous')}
              </button>
              <span>
                {t('common.pageOf', {
                  current: pagination.currentPage,
                  total: pagination.totalPages
                })}
              </span>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreatePollModal
          onClose={handleCreateModalClose}
        />
      )}

      {showDetailModal && selectedPoll && (
        <PollDetailModal
          poll={selectedPoll}
          onClose={handleDetailModalClose}
        />
      )}
    </div>
  );
};

export default Polls;
