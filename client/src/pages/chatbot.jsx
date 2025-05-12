import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Send, Image, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique user IDs
import { useChatbotStore } from "./chatbotStore";
import "./chatbot.css";

// Using a server-side proxy to avoid CORS issues
const API_URL = "https://equal-cristy-madhukiran-6b9e128e.koyeb.app/chat";
// Simple time formatter (replacement for date-fns)
const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const Chatbot = () => {
  // Get chatbot store functions
  const {
    messages: storeMessages,
    setMessages: setStoreMessages,
    addMessage,
    loadMessagesFromServer,
    saveMessagesToServer,
    loadMessagesFromLocalStorage,
    saveMessagesToLocalStorage
  } = useChatbotStore();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);

  const [guestId] = useState(() => {
    const savedGuestId = localStorage.getItem('guestId');
    if (savedGuestId) {
      return savedGuestId;
    }
    const newGuestId = uuidv4();
    localStorage.setItem('guestId', newGuestId);
    return newGuestId;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentToken = localStorage.getItem('token');
      setUserId(currentUserId);
      setToken(currentToken);
      setIsLoggedIn(!!currentUserId && !!currentToken);

      if (currentUserId && currentToken) {
        console.log('User is logged in with ID:', currentUserId);
      } else {
        console.log('User is not logged in');
      }
    };

    // Check initially
    checkLoginStatus();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);

    // Clean up
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history from server when logged in or from localStorage when not logged in
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (historyLoaded) {
        console.log('Chat history already loaded, skipping fetch');
        return;
      }

      try {
        let historyExists = false;

        if (isLoggedIn) {
          // Load from server if logged in
          console.log('Attempting to load chat history for logged-in user:', userId);
          historyExists = await loadMessagesFromServer(userId, token);
        } else {
          // Load from localStorage if not logged in
          console.log('Attempting to load chat history for guest user:', guestId);
          historyExists = loadMessagesFromLocalStorage(guestId);
        }

        if (historyExists) {
          // Use the messages from the store
          console.log('Setting messages from store:', storeMessages);
          setMessages(storeMessages);
          setHistoryLoaded(true);
          console.log('Chat history loaded successfully');
        } else {
          console.log('No chat history found, adding welcome message');
          // Add initial welcome message if no history exists
          const welcomeMessage = {
            sender: "bot",
            text: "Welcome to FashionMerge! I'm Alita, your personal style consultant. Whether you need outfit recommendations, trend insights, or styling advice for a specific occasion, I'm here to guide your fashion journey. Feel free to upload an image of a garment for personalized suggestions.",
            timestamp: formatTime(new Date())
          };
          setMessages([welcomeMessage]);
          setStoreMessages([welcomeMessage]);

          // Save the welcome message
          addMessage(welcomeMessage);
          if (isLoggedIn) {
            await saveMessagesToServer(userId, token);
          } else {
            saveMessagesToLocalStorage(guestId);
          }

          setHistoryLoaded(true);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Add initial welcome message if there's an error
        const welcomeMessage = {
          sender: "bot",
          text: "Welcome to FashionMerge! I'm Alita, your personal style consultant. Whether you need outfit recommendations, trend insights, or styling advice for a specific occasion, I'm here to guide your fashion journey. Feel free to upload an image of a garment for personalized suggestions.",
          timestamp: formatTime(new Date())
        };
        setMessages([welcomeMessage]);
        setStoreMessages([welcomeMessage]);
        setHistoryLoaded(true);
      }
    };

    fetchChatHistory();
  }, [isLoggedIn, userId, token, guestId]);

  // Initialize with welcome message if not logged in
  useEffect(() => {
    // Focus the input on component mount
    inputRef.current?.focus();

    // Add initial welcome message if not logged in and no messages exist
    if (!isLoggedIn && messages.length === 0 && !historyLoaded) {
      const welcomeMessage = {
        sender: "bot",
        text: "Welcome to FashionMerge! I'm Alita, your personal style consultant. Whether you need outfit recommendations, trend insights, or styling advice for a specific occasion, I'm here to guide your fashion journey. Feel free to upload an image of a garment for personalized suggestions.",
        timestamp: formatTime(new Date())
      };
      setMessages([welcomeMessage]);
      setStoreMessages([welcomeMessage]);
      setHistoryLoaded(true);
    }
  }, [isLoggedIn, messages.length, historyLoaded]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle file selection for images
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPEG, etc.)');
      return;
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview for the selected image
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle clicking the image upload button
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const message = inputValue.trim();
    if (!message && !selectedImage) return;

    // Clear input field
    setInputValue("");

    // Create timestamp
    const timestamp = new Date();
    const formattedTime = formatTime(timestamp);

    // Add user message to chat
    const userMessage = {
      sender: "user",
      text: message || "Uploaded an image",
      timestamp: formattedTime,
      hasImage: !!selectedImage,
      imagePreview: imagePreview
    };

    // Update local state
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Update store state
    addMessage(userMessage);

    // Show typing indicator
    setIsTyping(true);
    setError(null);

    try {
      // Create FormData if we have an image
      let response;

      // Use userId if logged in, otherwise use guestId
      const chatApiId = isLoggedIn ? userId : guestId;
      console.log('Using ID for chat API:', chatApiId);

      if (selectedImage) {
        const formData = new FormData();
        if (message) {
          formData.append('message', message);
        }
        formData.append('image', selectedImage);
        formData.append('userId', chatApiId); // Use the user ID or guest ID for the API

        response = await fetch(API_URL, {
          method: "POST",
          body: formData
        });

        // Clear the selected image after sending
        handleClearImage();
      } else {
        // Regular text message without an image
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message, userId: chatApiId })
        });
      }

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Add bot message
      const botMessage = {
        sender: "bot",
        text: data.response || "Sorry, I couldn't process your request.",
        timestamp: formatTime(new Date())
      };

      // Update local state
      setMessages(prevMessages => [...prevMessages, botMessage]);

      // Update store state
      addMessage(botMessage);

      // Save chat history
      if (isLoggedIn) {
        // Save to server if logged in
        saveMessagesToServer(userId, token);
      } else {
        // Save to localStorage if not logged in
        saveMessagesToLocalStorage(guestId);
      }
    } catch (err) {
      console.error("Error communicating with the API:", err);
      setError("Failed to get a response. Please try again later.");

      // Add error message
      const errorMessage = {
        sender: "bot",
        text: "Sorry, there was an error processing your request. Please try again later.",
        timestamp: formatTime(new Date()),
        isError: true
      };

      // Update local state
      setMessages(prevMessages => [...prevMessages, errorMessage]);

      // Update store state
      addMessage(errorMessage);

      // Save chat history
      if (isLoggedIn) {
        // Save to server if logged in
        saveMessagesToServer(userId, token);
      } else {
        // Save to localStorage if not logged in
        saveMessagesToLocalStorage(guestId);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Render markdown with sanitization
  const renderMarkdown = (text) => {
    try {
      const rawMarkup = marked.parse(text);
      const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
      return { __html: sanitizedMarkup };
    } catch (err) {
      console.error("Error rendering markdown:", err);
      return { __html: text };
    }
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <div className="chatbot-info">
          <h1 className="chatbot-title">Alita</h1>
          <p className="chatbot-status">Fashion Designer • Online</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-bubble">
              {message.sender === 'bot' ? (
                <div
                  className={`message-text ${message.isError ? 'error-message' : ''}`}
                  dangerouslySetInnerHTML={renderMarkdown(message.text)}
                />
              ) : (
                <>
                  <p className="message-text">{message.text}</p>
                  {message.hasImage && message.imagePreview && (
                    <div className="message-image-container">
                      <img
                        src={message.imagePreview}
                        alt="User uploaded"
                        className="message-image"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <span className="message-timestamp">{message.timestamp}</span>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="message-wrapper bot-message">
            <div className="message-bubble typing-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !isTyping && (
          <div className="api-error">
            <p>{error}</p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="chatbot-input-container">
        {/* Image Preview */}
        {imagePreview && (
          <div className="image-preview-container">
            <div className="image-preview">
              <img src={imagePreview} alt="Selected" />
              <button
                type="button"
                className="clear-image-button"
                onClick={handleClearImage}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="chatbot-form">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden-file-input"
            aria-label="Upload image"
          />

          {/* Image upload button */}
          <button
            type="button"
            className="image-upload-button"
            onClick={handleImageButtonClick}
            disabled={isTyping}
            aria-label="Attach image"
          >
            <Image size={20} />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask about fashion trends, styling advice..."
            className="chatbot-input"
            disabled={isTyping}
          />

          {/* Send button */}
          <button
            type="submit"
            className="chatbot-send-button"
            disabled={isTyping || (!inputValue.trim() && !selectedImage)}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;