import { create } from 'zustand';
import { POLLS_ENDPOINTS } from '../config/api';

export const usePollsStore = create((set, get) => ({
  // State
  polls: [],
  activePoll: null,
  notifications: [],
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sort: 'recent',
    category: 'all',
    type: 'all'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPolls: 0
  },

  // Actions
  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters
      }
    }));
  },

  // Fetch polls with current filters
  fetchPolls: async (token) => {
    const { filters } = get();

    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.type !== 'all' && { type: filters.type })
      }).toString();

      const response = await fetch(`${POLLS_ENDPOINTS.GET_POLLS}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch polls');
      }

      const data = await response.json();

      set({
        polls: data.data.polls,
        pagination: {
          currentPage: data.data.currentPage,
          totalPages: data.data.totalPages,
          totalPolls: data.data.totalPolls
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching polls:', error);
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  // Fetch a single poll by ID
  fetchPoll: async (pollId, token) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(POLLS_ENDPOINTS.GET_POLL(pollId), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch poll');
      }

      const data = await response.json();

      set({
        activePoll: data.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching poll:', error);
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  // Create a new poll
  createPoll: async (pollData, token) => {
    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();

      // Add text fields
      formData.append('title', pollData.title);
      formData.append('description', pollData.description || '');
      formData.append('type', pollData.type);
      formData.append('category', pollData.category);

      if (pollData.expiresAt) {
        formData.append('expiresAt', pollData.expiresAt);
      }

      // Add options
      formData.append('options', JSON.stringify(pollData.options.map(opt => opt.content)));

      // Add images for visual polls
      if (pollData.type === 'visual' && pollData.images) {
        pollData.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }

      const response = await fetch(POLLS_ENDPOINTS.CREATE_POLL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create poll');
      }

      const data = await response.json();

      // Refresh polls list
      await get().fetchPolls(token);

      set({ isLoading: false });

      return data.data;
    } catch (error) {
      console.error('Error creating poll:', error);
      set({
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Vote on a poll
  votePoll: async (pollId, optionIndex, token) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(POLLS_ENDPOINTS.VOTE_POLL(pollId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ optionIndex })
      });

      if (!response.ok) {
        throw new Error('Failed to vote on poll');
      }

      const data = await response.json();

      // Update active poll if it's the one being voted on
      const { activePoll } = get();
      if (activePoll && activePoll._id === pollId) {
        set({ activePoll: data.data });
      }

      // Update poll in polls list
      set(state => ({
        polls: state.polls.map(poll =>
          poll._id === pollId ? data.data : poll
        ),
        isLoading: false
      }));

      return data.data;
    } catch (error) {
      console.error('Error voting on poll:', error);
      set({
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Comment on a poll
  commentPoll: async (pollId, content, token) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(POLLS_ENDPOINTS.COMMENT_POLL(pollId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to comment on poll');
      }

      const data = await response.json();

      // Update active poll if it's the one being commented on
      const { activePoll } = get();
      if (activePoll && activePoll._id === pollId) {
        set(state => ({
          activePoll: {
            ...state.activePoll,
            comments: [...state.activePoll.comments, data.data]
          }
        }));
      }

      set({ isLoading: false });

      return data.data;
    } catch (error) {
      console.error('Error commenting on poll:', error);
      set({
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Fetch notifications
  fetchNotifications: async (token) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(POLLS_ENDPOINTS.GET_NOTIFICATIONS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      set({
        notifications: data.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId, token) => {
    try {
      const response = await fetch(POLLS_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update notification in state
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Add a new notification (from WebSocket)
  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications]
    }));
  },

  // Update poll in real-time (from WebSocket)
  updatePollInRealtime: (pollUpdate) => {
    const { polls, activePoll } = get();

    // Update in polls list
    if (polls.length > 0) {
      set({
        polls: polls.map(poll =>
          poll._id === pollUpdate.pollId
            ? { ...poll, ...pollUpdate }
            : poll
        )
      });
    }

    // Update active poll if it's the one being updated
    if (activePoll && activePoll._id === pollUpdate.pollId) {
      set({
        activePoll: { ...activePoll, ...pollUpdate }
      });
    }
  },

  // Add comment in real-time (from WebSocket)
  addCommentInRealtime: (commentData) => {
    const { activePoll } = get();

    // Update active poll if it's the one being commented on
    if (activePoll && activePoll._id === commentData.pollId) {
      set(state => ({
        activePoll: {
          ...state.activePoll,
          comments: [...state.activePoll.comments, commentData.comment]
        }
      }));
    }
  },

  // Reset state
  resetState: () => {
    set({
      polls: [],
      activePoll: null,
      isLoading: false,
      error: null,
      filters: {
        page: 1,
        limit: 10,
        sort: 'recent',
        category: 'all',
        type: 'all'
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalPolls: 0
      }
    });
  },

  // Delete a poll
  deletePoll: async (pollId, token) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(POLLS_ENDPOINTS.DELETE_POLL(pollId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete poll');
      }

      // Remove poll from state
      set(state => ({
        polls: state.polls.filter(poll => poll._id !== pollId),
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('Error deleting poll:', error);
      set({
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Remove poll from state (for socket events)
  removePollFromState: (pollId) => {
    set(state => ({
      polls: state.polls.filter(poll => poll._id !== pollId)
    }));
  }
}));
