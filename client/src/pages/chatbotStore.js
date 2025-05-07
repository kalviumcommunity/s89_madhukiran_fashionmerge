import { create } from 'zustand';

export const useChatbotStore = create((set, get) => ({
  messages: [],

  // Set messages directly (used when loading from server)
  setMessages: (messages) => {
    set({ messages });
  },

  // Add a new message to the chat history
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  // Add multiple messages to the chat history
  addMessages: (newMessages) => {
    set((state) => ({
      messages: [...state.messages, ...newMessages]
    }));
  },

  // Clear all messages
  clearMessages: () => {
    set({ messages: [] });
  },

  // Save messages to localStorage for guest users
  saveMessagesToLocalStorage: (guestId) => {
    if (!guestId) {
      console.log('No guest ID provided, cannot save chat history');
      return false;
    }

    try {
      const messages = get().messages;
      console.log('Saving chat history to localStorage for guest:', guestId, 'Messages count:', messages.length);

      localStorage.setItem(`chatHistory_${guestId}`, JSON.stringify(messages));
      return true;
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
      return false;
    }
  },

  // Load messages from localStorage for guest users
  loadMessagesFromLocalStorage: (guestId) => {
    if (!guestId) {
      console.log('No guest ID provided, cannot load chat history');
      return false;
    }

    try {
      const savedMessages = localStorage.getItem(`chatHistory_${guestId}`);

      if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        console.log('Loaded chat history from localStorage for guest:', guestId, 'Messages count:', messages.length);
        set({ messages });
        return true;
      } else {
        console.log('No chat history found in localStorage for guest:', guestId);
        return false;
      }
    } catch (error) {
      console.error('Error loading chat history from localStorage:', error);
      return false;
    }
  },

  // Save messages to the server
  saveMessagesToServer: async (userId, token) => {
    if (!userId || !token) {
      console.log('User not logged in, chat history not saved to server');
      return;
    }

    try {
      const messages = get().messages;
      console.log('Saving chat history to server for user:', userId, 'Messages count:', messages.length);

      // Convert messages to the format expected by the server
      const chatbotHistory = messages.map(msg => {
        // Make sure we have a valid sender value
        const sender = msg.sender === 'bot' ? 'bot' : 'user';

        return {
          message: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text),
          timestamp: new Date(),
          sender: sender
        };
      });

      console.log('Converted chat history for server:', chatbotHistory);

      const response = await fetch(`http://localhost:5000/user-activity/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatbotHistory }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to save chat history: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Chat history saved successfully:', result);
      return true;
    } catch (error) {
      console.error('Error saving chat history:', error);
      return false;
    }
  },

  // Load messages from the server
  loadMessagesFromServer: async (userId, token) => {
    if (!userId || !token) {
      console.log('User not logged in, cannot load chat history from server');
      return false;
    }

    try {
      console.log('Fetching chat history for user:', userId);
      const response = await fetch(`http://localhost:5000/user-activity/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to fetch chat history: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Server response for chat history:', result);

      if (result.data && result.data.chatbotHistory && result.data.chatbotHistory.length > 0) {
        console.log('Fetched chat history from server:', result.data.chatbotHistory);

        // Convert server format to the format used by the chatbot component
        const messages = result.data.chatbotHistory.map(msg => {
          // Determine sender - use the sender field if available, otherwise infer from message content
          let sender = 'user';
          if (msg.sender) {
            sender = msg.sender;
          } else if (msg.message && typeof msg.message === 'string' &&
                    (msg.message.includes('Welcome to FashionMerge') ||
                     msg.message.includes("I'm Alita"))) {
            sender = 'bot';
          }

          // Format timestamp
          let timestamp = 'Unknown time';
          if (msg.timestamp) {
            try {
              timestamp = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch (e) {
              console.error('Error formatting timestamp:', e);
            }
          }

          return {
            sender: sender,
            text: msg.message || '',
            timestamp: timestamp
          };
        });

        console.log('Converted messages for client:', messages);
        set({ messages });
        return true;
      } else {
        console.log('No chat history found on server');
        return false;
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return false;
    }
  }
}));
