import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Send, Image, X, Mic, MicOff, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique user IDs
import { useTranslation } from 'react-i18next';
import { useChatbotStore } from "./chatbotStore";
import "./chatbot.css";

// Using a server-side proxy to avoid CORS issues
const PRIMARY_API_URL = "https://equal-cristy-madhukiran-6b9e128e.koyeb.app/chat";
// Fallback to a different API if the primary one fails - use the correct endpoint
const FALLBACK_API_URL = "https://equal-cristy-madhukiran-6b9e128e.koyeb.app/chat"; // Same as primary, no /api prefix
// Third option if both fail
const THIRD_API_URL = "https://equal-cristy-madhukiran-6b9e128e.koyeb.app/api/v1/chat";
// Start with the primary API
let API_URL = PRIMARY_API_URL;
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
  // Get translation function
  const { t } = useTranslation();

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

  // Voice-related state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.95); // Default sweet voice volume
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const speechQueueRef = useRef([]);

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
            text: t('alita.welcomeMessage'),
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
          text: t('alita.welcomeMessage'),
          timestamp: formatTime(new Date())
        };
        setMessages([welcomeMessage]);
        setStoreMessages([welcomeMessage]);
        setHistoryLoaded(true);
      }
    };

    fetchChatHistory();
  }, [isLoggedIn, userId, token, guestId, addMessage, historyLoaded, loadMessagesFromLocalStorage, loadMessagesFromServer, saveMessagesToLocalStorage, saveMessagesToServer, setStoreMessages, storeMessages, t]);

  // Initialize with welcome message if not logged in
  useEffect(() => {
    // Focus the input on component mount
    inputRef.current?.focus();

    // Add initial welcome message if not logged in and no messages exist
    if (!isLoggedIn && messages.length === 0 && !historyLoaded) {
      const welcomeMessage = {
        sender: "bot",
        text: t('alita.welcomeMessage'),
        timestamp: formatTime(new Date())
      };
      setMessages([welcomeMessage]);
      setStoreMessages([welcomeMessage]);
      setHistoryLoaded(true);
    }
  }, [isLoggedIn, messages.length, historyLoaded, setStoreMessages, t]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input:', transcript);
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Voice recognition error. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
      };

      recognitionRef.current = recognition;
      setSpeechRecognition(recognition);
    }

    // Check if browser supports speech synthesis
    if (window.speechSynthesis) {
      console.log('🔊 Speech synthesis is supported');
      setSpeechSynthesis(window.speechSynthesis);

      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 Loading voices, count:', voices.length);
        console.log('🔊 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        setAvailableVoices(voices);

        // Auto-select the best voice
        if (voices.length > 0) {
          selectBestVoice(voices);
        } else {
          console.log('⚠️ No voices available yet');
        }
      };

      // Load voices immediately if available
      loadVoices();

      // Also listen for voices changed event (some browsers load voices asynchronously)
      window.speechSynthesis.onvoiceschanged = () => {
        console.log('🔊 Voices changed event fired');
        loadVoices();
      };
    } else {
      console.log('❌ Speech synthesis is not supported in this browser');
    }

    // Add user interaction handler to initialize speech synthesis
    const initializeSpeechSynthesis = () => {
      if ('speechSynthesis' in window && !window.speechSynthesisUserInteractionInitiated) {
        console.log('Initializing speech synthesis on user interaction...');
        try {
          // Create a silent utterance to initialize speech synthesis
          const initUtterance = new SpeechSynthesisUtterance('');
          initUtterance.volume = 0;
          window.speechSynthesis.speak(initUtterance);
          window.speechSynthesisUserInteractionInitiated = true;
          console.log('Speech synthesis initialized successfully');
        } catch (error) {
          console.warn('Failed to initialize speech synthesis:', error);
        }
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', initializeSpeechSynthesis, { once: true });
    document.addEventListener('keydown', initializeSpeechSynthesis, { once: true });
    document.addEventListener('touchstart', initializeSpeechSynthesis, { once: true });

    return () => {
      document.removeEventListener('click', initializeSpeechSynthesis);
      document.removeEventListener('keydown', initializeSpeechSynthesis);
      document.removeEventListener('touchstart', initializeSpeechSynthesis);
    };
  }, []);

  // Function to select the most naturally sounding sweet female voice
  const selectBestVoice = (voices) => {
    console.log('🔊 Selecting sweetest female voice from', voices.length, 'available voices');

    // Priority list of the sweetest, most natural female voices
    const sweetFemaleVoices = [
      // Premium Neural voices (most natural and sweet)
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Emma Online (Natural) - English (United States)',
      'Microsoft Michelle Online (Natural) - English (United States)',
      'Microsoft Ana Online (Natural) - English (United States)',

      // Google's sweetest female voices
      'Google US English Female',
      'Google UK English Female',
      'en-US-Neural2-F',
      'en-US-Neural2-H',
      'en-GB-Neural2-A',
      'en-GB-Neural2-C',

      // Apple's sweetest voices (known for natural sound)
      'Samantha',        // Very natural and sweet
      'Allison',         // Warm and friendly
      'Ava',            // Soft and pleasant
      'Susan',          // Clear and sweet
      'Karen',          // Gentle tone
      'Victoria',       // Elegant and sweet
      'Princess',       // Playful and sweet
      'Vicki',          // Warm female voice

      // Microsoft standard voices (still good quality)
      'Microsoft Zira - English (United States)',
      'Microsoft Hazel - English (Great Britain)',
      'Microsoft Eva - English (Australia)',
      'Microsoft Linda - English (Canada)',

      // Additional sweet-sounding voices
      'Anna',
      'Amelie',
      'Emma',
      'Chloe',
      'Grace',
      'Sophia'
    ];

    let bestVoice = null;

    // Find the sweetest available female voice
    for (const preferredName of sweetFemaleVoices) {
      bestVoice = voices.find(voice =>
        voice.name.toLowerCase().includes(preferredName.toLowerCase()) ||
        voice.name === preferredName
      );
      if (bestVoice) {
        console.log('� Selected sweet female voice:', bestVoice.name);
        setSelectedVoice(bestVoice);
        return;
      }
    }

    // If no preferred voice found, look for neural/premium female voices
    if (!bestVoice) {
      bestVoice = voices.find(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.toLowerCase().includes('neural') ||
         voice.name.toLowerCase().includes('premium') ||
         voice.name.toLowerCase().includes('enhanced') ||
         voice.name.toLowerCase().includes('natural')) &&
        (voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('aria') ||
         voice.name.toLowerCase().includes('jenny') ||
         voice.name.toLowerCase().includes('emma') ||
         voice.name.toLowerCase().includes('michelle'))
      );
      if (bestVoice) {
        console.log('� Selected premium female voice:', bestVoice.name);
      }
    }

    // Fallback to any sweet-sounding female voice
    if (!bestVoice) {
      const femaleKeywords = ['female', 'woman', 'girl', 'lady', 'samantha', 'allison', 'ava', 'susan', 'karen', 'victoria', 'anna', 'emma', 'chloe', 'grace', 'sophia', 'aria', 'jenny', 'michelle', 'zira', 'hazel'];

      bestVoice = voices.find(voice =>
        voice.lang.startsWith('en') &&
        femaleKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
      );
      if (bestVoice) {
        console.log('� Selected female voice:', bestVoice.name);
      }
    }

    // Final fallback to first English voice
    if (!bestVoice) {
      bestVoice = voices.find(voice => voice.lang.startsWith('en'));
      if (bestVoice) {
        console.log('🔊 Selected first English voice:', bestVoice.name);
      }
    }

    // Last resort - use any voice
    if (!bestVoice && voices.length > 0) {
      bestVoice = voices[0];
      console.log('🔊 Using first available voice as last resort:', bestVoice.name);
    }

    if (bestVoice) {
      console.log('� Final selected sweet voice:', bestVoice.name, 'Language:', bestVoice.lang);
      setSelectedVoice(bestVoice);
    } else {
      console.log('❌ No suitable voice found');
    }
  };

  // Voice functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setError('Could not start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text) => {
    console.log('🔊 speakText called with:', text?.substring(0, 50) + '...');
    console.log('🔊 voiceEnabled:', voiceEnabled);
    console.log('🔊 speechSynthesis available:', !!speechSynthesis);
    console.log('🔊 selectedVoice:', selectedVoice?.name);
    console.log('🔊 speechSynthesis.speaking:', speechSynthesis?.speaking);
    console.log('🔊 speechSynthesis.pending:', speechSynthesis?.pending);

    if (!voiceEnabled) {
      console.log('❌ Voice is disabled, not speaking');
      return;
    }

    if (!speechSynthesis) {
      console.log('❌ Speech synthesis not available');
      return;
    }

    if (!text || text.trim() === '') {
      console.log('❌ No text to speak');
      return;
    }

    // More aggressive speech cancellation
    try {
      // Cancel any existing speech
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        console.log('🔊 Stopping existing speech...');
        speechSynthesis.cancel();

        // Wait longer for complete cancellation
        setTimeout(() => {
          // Double-check cancellation worked
          if (speechSynthesis.speaking || speechSynthesis.pending) {
            console.log('🔊 Speech still active, forcing another cancel...');
            speechSynthesis.cancel();
          }

          // Start new speech after ensuring clean state
          setTimeout(() => {
            startNewSpeech(text);
          }, 100);
        }, 300);
      } else {
        // No existing speech, start immediately
        startNewSpeech(text);
      }
    } catch (error) {
      console.warn('⚠️ Error in speech management:', error);
      // Fallback: try to start speech anyway
      setTimeout(() => {
        startNewSpeech(text);
      }, 500);
    }
  };

  const startNewSpeech = (text) => {
    console.log('🔊 startNewSpeech called with:', text?.substring(0, 50) + '...');

    // Clean the text for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/`(.*?)`/g, '$1') // Remove code markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\n+/g, '. ') // Replace newlines with periods
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    console.log('🔊 Cleaned text:', cleanText?.substring(0, 50) + '...');

    if (!cleanText) {
      console.log('❌ No clean text to speak');
      return;
    }

    // Check if voices are available
    const voices = speechSynthesis.getVoices();
    console.log('🔊 Available voices:', voices.length);

    if (voices.length === 0) {
      console.log('⚠️ No voices available, waiting for voices to load...');
      // Wait for voices to load and retry
      setTimeout(() => {
        const newVoices = speechSynthesis.getVoices();
        if (newVoices.length > 0) {
          console.log('🔊 Voices loaded, retrying speech...');
          selectBestVoice(newVoices);
          startNewSpeech(text);
        } else {
          console.log('❌ Still no voices available after waiting');
        }
      }, 500);
      return;
    }

    try {
      console.log('🔊 Creating speech utterance...');
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Configure voice settings for sweet, natural delivery
      utterance.rate = 0.85; // Slower pace for a sweeter, more gentle delivery
      utterance.pitch = 1.1; // Slightly higher pitch for a sweeter female voice
      utterance.volume = voiceVolume; // User-adjustable volume

      console.log('� Sweet voice utterance created with settings:', {
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume,
        text: cleanText.substring(0, 50) + '...'
      });

      // Use the pre-selected best voice or find a good default
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🔊 Using selected voice:', selectedVoice.name);
      } else {
        // Try to find a good English voice
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        if (englishVoices.length > 0) {
          utterance.voice = englishVoices[0];
          console.log('🔊 Using default English voice:', englishVoices[0].name);
        } else {
          console.log('🔊 No voice selected, using system default');
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('✅ Speech started successfully:', cleanText.substring(0, 50) + '...');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('✅ Speech finished successfully');
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);

        // Handle specific error types
        if (event.error === 'interrupted') {
          console.log('🔊 Speech was interrupted (normal when cancelling previous speech)');
          // This is normal behavior when we cancel previous speech, don't treat as error
          return;
        } else if (event.error === 'canceled') {
          console.log('🔊 Speech was canceled - this is normal');
          // This is also normal behavior, don't retry
          return;
        } else {
          console.warn('❌ Speech synthesis error:', event.error);

          // Only retry for actual errors
          if (event.error === 'network' || event.error === 'synthesis-failed' || event.error === 'synthesis-unavailable') {
            console.log('🔄 Retrying speech due to error:', event.error);
            setTimeout(() => {
              console.log('🔄 Attempting retry...');
              const retryUtterance = new SpeechSynthesisUtterance(cleanText);
              retryUtterance.rate = 0.85; // Sweet, gentle pace
              retryUtterance.pitch = 1.1; // Sweeter female pitch
              retryUtterance.volume = voiceVolume; // User-adjustable volume

              // Use available voice
              const voices = speechSynthesis.getVoices();
              const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
              if (englishVoices.length > 0) {
                retryUtterance.voice = englishVoices[0];
              }

              retryUtterance.onstart = () => {
                setIsSpeaking(true);
                console.log('✅ Retry speech started successfully');
              };
              retryUtterance.onend = () => {
                setIsSpeaking(false);
                console.log('✅ Retry speech finished successfully');
              };
              retryUtterance.onerror = (retryEvent) => {
                console.warn('❌ Retry speech also failed:', retryEvent.error);
                setIsSpeaking(false);
              };
              speechSynthesis.speak(retryUtterance);
            }, 1000);
          } else {
            console.error('❌ Unhandled speech error:', event.error);
          }
        }
      };

      utteranceRef.current = utterance;

      console.log('Calling speechSynthesis.speak()...');
      console.log('speechSynthesis.speaking before speak():', speechSynthesis.speaking);
      console.log('speechSynthesis.pending before speak():', speechSynthesis.pending);

      // Fix for speech cancellation issue - ensure speech synthesis is ready
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }

      // Additional browser compatibility fixes
      speechSynthesis.speak(utterance);

      // Chrome/Edge fix: Resume if it gets paused immediately
      setTimeout(() => {
        if (speechSynthesis.paused) {
          console.log('Speech was paused, resuming...');
          speechSynthesis.resume();
        }
      }, 100);

      // Additional fix for some browsers that need a second attempt
      setTimeout(() => {
        if (!speechSynthesis.speaking && !speechSynthesis.pending) {
          console.log('Speech did not start, attempting second try...');
          speechSynthesis.speak(utterance);
        }
      }, 200);

      console.log('speechSynthesis.speak() called');
      console.log('speechSynthesis.speaking after speak():', speechSynthesis.speaking);
      console.log('speechSynthesis.pending after speak():', speechSynthesis.pending);

    } catch (error) {
      console.error('❌ Error creating speech utterance:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    try {
      if (speechSynthesis && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        console.log('Speech stopped by user');
      }
    } catch (error) {
      console.warn('Error stopping speech:', error);
      setIsSpeaking(false);
    }
  };

  // Volume control functions
  const setVolume = (volume) => {
    console.log('🔊 Set volume called with:', volume);
    const newVolume = Math.max(0.0, Math.min(1.0, volume));
    setVoiceVolume(newVolume);

    // Auto-disable voice when volume is 0
    if (newVolume === 0) {
      setVoiceEnabled(false);
      if (isSpeaking) {
        stopSpeaking();
      }
      console.log('🔊 Voice disabled due to 0 volume');
    } else if (!voiceEnabled && newVolume > 0) {
      // Auto-enable voice when volume is increased from 0
      setVoiceEnabled(true);
      console.log('🔊 Voice enabled due to volume increase');
    }

    console.log('🔊 Volume set to:', newVolume);
  };

  // Get appropriate volume icon based on volume level
  const getVolumeIcon = () => {
    if (!voiceEnabled || voiceVolume === 0) {
      return <VolumeX size={20} />;
    } else if (voiceVolume < 0.5) {
      return <Volume2 size={20} style={{ opacity: 0.7 }} />;
    } else {
      return <Volume2 size={20} />;
    }
  };



  // Effect to adjust textarea height when input value changes or component mounts
  useEffect(() => {
    if (inputRef.current) {
      adjustTextareaHeight(inputRef.current);
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Auto-resize the textarea
    adjustTextareaHeight(e.target);
  };

  // Function to adjust textarea height based on content
  const adjustTextareaHeight = (textarea) => {
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Set the height to match content (scrollHeight)
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Handle key press events in the input field
  const handleKeyDown = (e) => {
    // Check for Shift+Enter to add a new line
    if (e.key === 'Enter' && e.shiftKey) {
      // Don't submit the form
      e.preventDefault();

      // Insert a newline character at the cursor position
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = inputValue.substring(0, cursorPosition);
      const textAfterCursor = inputValue.substring(cursorPosition);

      // Update the input value with a new line
      setInputValue(textBeforeCursor + '\n' + textAfterCursor);

      // Set cursor position after the inserted newline (needs to be done after render)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = cursorPosition + 1;
          inputRef.current.selectionEnd = cursorPosition + 1;
          adjustTextareaHeight(inputRef.current);
        }
      }, 0);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Regular Enter key (without Shift) submits the form
      e.preventDefault();
      if (inputValue.trim() || selectedImage) {
        sendMessage(e);
      }
    }
  };

  // Handle file selection for images
  // Resize image to reduce file size
  const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      // Create a FileReader to read the file
      const reader = new FileReader();

      // Set up the FileReader onload callback
      reader.onload = (readerEvent) => {
        // Create an image object
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }

          // Create a canvas and draw the resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert the canvas to a Blob
          canvas.toBlob((blob) => {
            // Create a new File from the blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });

            resolve(resizedFile);
          }, file.type, quality);
        };

        // Set the source of the image to the FileReader result
        img.src = readerEvent.target.result;
      };

      // Handle errors
      reader.onerror = (error) => reject(error);

      // Read the file as a data URL
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPEG, etc.)');
      return;
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size is too large. Attempting to resize...');

      try {
        // Resize the image
        const resizedFile = await resizeImage(file);
        console.log('Original size:', file.size, 'Resized size:', resizedFile.size);

        if (resizedFile.size > 5 * 1024 * 1024) {
          setError('Image is still too large after resizing. Please select a smaller image.');
          return;
        }

        setSelectedImage(resizedFile);

        // Create preview for the resized image
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(resizedFile);

        return;
      } catch (error) {
        console.error('Error resizing image:', error);
        setError('Error resizing image. Please select a smaller image.');
        return;
      }
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

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

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
        try {
          // Try to resize the image if it's larger than 1MB to improve reliability
          let imageToUpload = selectedImage;
          if (selectedImage.size > 1 * 1024 * 1024) {
            try {
              console.log('Image is large, attempting to resize before sending to API');
              // Use a higher compression ratio for API uploads
              imageToUpload = await resizeImage(selectedImage, 600, 600, 0.7);
              console.log('Successfully resized image for API upload:',
                'Original:', selectedImage.size, 'bytes,',
                'Resized:', imageToUpload.size, 'bytes,',
                'Reduction:', Math.round((1 - imageToUpload.size / selectedImage.size) * 100) + '%'
              );
            } catch (resizeError) {
              console.error('Failed to resize image before API upload:', resizeError);
              // Continue with original image if resize fails
              imageToUpload = selectedImage;
            }
          }

          const formData = new FormData();
          if (message) {
            formData.append('message', message);
          }
          formData.append('image', imageToUpload);
          formData.append('userId', chatApiId); // Use the user ID or guest ID for the API

          console.log('Sending image to chatbot API:', {
            imageSize: imageToUpload.size,
            imageType: imageToUpload.type,
            message: message || '(no message)',
            userId: chatApiId
          });

          // Set a longer timeout for image uploads
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          try {
            response = await fetch(API_URL, {
              method: "POST",
              body: formData,
              signal: controller.signal
            });

            clearTimeout(timeoutId);
          } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
              throw new Error('Request timed out. The server took too long to process the image.');
            }
            throw fetchError;
          }

          // Log response status for debugging
          console.log('Image upload response status:', response.status);

          // Clear the selected image after sending
          handleClearImage();
        } catch (uploadError) {
          console.error('Error uploading image to chatbot:', uploadError);
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }
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
        // Try to get more detailed error information
        let errorMessage = `Server responded with status: ${response.status}`;
        try {
          const errorData = await response.text();
          console.error('Error response from chatbot API:', errorData);
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
        }

        // Try fallback APIs if we get an error
        if ((response.status === 404 || response.status === 500) &&
            (API_URL === PRIMARY_API_URL || API_URL === FALLBACK_API_URL)) {

          // Determine which API to try next
          let nextApiUrl;
          if (API_URL === PRIMARY_API_URL) {
            console.log('Primary API failed with status:', response.status, 'trying fallback API...');
            nextApiUrl = FALLBACK_API_URL;
          } else {
            console.log('Fallback API failed with status:', response.status, 'trying third API...');
            nextApiUrl = THIRD_API_URL;
          }

          // Update the API URL for this request
          API_URL = nextApiUrl;
          console.log('Switching to API URL:', API_URL);

          // Try again with the next API
          try {
            if (selectedImage) {
              const formData = new FormData();
              if (message) {
                formData.append('message', message);
              }
              formData.append('image', selectedImage);
              formData.append('userId', chatApiId);

              response = await fetch(API_URL, {
                method: "POST",
                body: formData
              });
            } else {
              response = await fetch(API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ message, userId: chatApiId })
              });
            }

            // If this API also fails and we have one more to try
            if (!response.ok && API_URL === FALLBACK_API_URL) {
              console.log('Fallback API also failed with status:', response.status, 'trying third API...');
              API_URL = THIRD_API_URL;

              // Try the third API
              if (selectedImage) {
                const formData = new FormData();
                if (message) {
                  formData.append('message', message);
                }
                formData.append('image', selectedImage);
                formData.append('userId', chatApiId);

                response = await fetch(API_URL, {
                  method: "POST",
                  body: formData
                });
              } else {
                response = await fetch(API_URL, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ message, userId: chatApiId })
                });
              }

              // If all APIs fail, throw the original error
              if (!response.ok) {
                console.error('All API endpoints failed. Last status:', response.status);
                throw new Error('All chatbot API endpoints failed. Please try again later.');
              }
            } else if (!response.ok) {
              // If we've tried all APIs and they all failed
              console.error('All API endpoints failed. Last status:', response.status);
              throw new Error('All chatbot API endpoints failed. Please try again later.');
            }

            console.log('Alternative API succeeded with status:', response.status);
          } catch (fallbackError) {
            console.error('Error using alternative API:', fallbackError);
            throw new Error('Failed to connect to the chatbot service. Please try again later.');
          }
        } else {
          // If it's not a 404/500 error or we've already tried all APIs, throw the error
          throw new Error(errorMessage);
        }
      }

      let data;
      try {
        data = await response.json();
        console.log('Chatbot API response:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server. Could not parse JSON.');
      }

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

      // Speak the bot response if voice is enabled
      console.log('Checking if should speak bot response...');
      console.log('voiceEnabled:', voiceEnabled);
      console.log('botMessage.text:', botMessage.text?.substring(0, 50) + '...');

      if (voiceEnabled && botMessage.text) {
        console.log('Will speak bot response in 800ms...');
        // Add a delay to ensure the message is rendered and any previous speech is stopped
        setTimeout(() => {
          console.log('Timeout reached, calling speakText...');
          speakText(botMessage.text);
        }, 800);
      } else {
        console.log('Not speaking because:', {
          voiceEnabled,
          hasText: !!botMessage.text
        });
      }

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

      // Create a more descriptive error message for the user
      let userErrorMessage = "Failed to get a response. Please try again later.";

      // Create the error message object that will be shown in the chat
      let chatErrorMessage = {
        sender: "bot",
        text: "Sorry, there was an error processing your request. Please try again later.",
        timestamp: formatTime(new Date()),
        isError: true
      };

      // Check if it's an image-related error
      if (selectedImage && err.message.includes('image')) {
        userErrorMessage = "There was a problem processing your image. Please try a different image or format (JPG/PNG recommended).";
      } else if (err.message.includes('500')) {
        userErrorMessage = "The server encountered an internal error. This might be a temporary issue, please try again later.";

        // For 500 errors with images, provide a more helpful message
        if (selectedImage) {
          chatErrorMessage = {
            sender: "bot",
            text: "I'm having trouble analyzing your image right now. This could be due to:\n\n" +
                  "- The image format (try JPG or PNG)\n" +
                  "- Image size (try a smaller image under 1MB)\n" +
                  "- Temporary server issues\n\n" +
                  "You can try describing the outfit or fashion item in text instead, and I'll do my best to help!",
            timestamp: formatTime(new Date()),
            isError: true
          };
        }
      }

      setError(userErrorMessage);

      // Update local state
      setMessages(prevMessages => [...prevMessages, chatErrorMessage]);

      // Update store state
      addMessage(chatErrorMessage);

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
          <h1 className="chatbot-title">{t('alita.chatbotTitle')} 🎤</h1>
          <p className="chatbot-status">
            {isSpeaking ? '🗣️ Speaking...' : t('alita.chatbotStatus')}
            {selectedVoice && (
              <span className="voice-quality-indicator">
                {selectedVoice.name.includes('Neural') || selectedVoice.name.includes('Premium') ?
                  ' • 🎯 Premium Voice' :
                  selectedVoice.name.includes('Google') || selectedVoice.name.includes('Microsoft') ?
                  ' • ✨ Enhanced Voice' :
                  ' • 🔊 Standard Voice'
                }
              </span>
            )}
          </p>
        </div>
        <div className="voice-controls">
          {/* Volume control with hover slider */}
          <div className="volume-control-container">
            <div className="volume-icon">
              {getVolumeIcon()}
            </div>

            {/* Hover volume slider */}
            <div className="volume-hover-panel">
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={voiceVolume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                }}
                className="volume-hover-slider"
                title={`Volume: ${Math.round(voiceVolume * 100)}%`}
              />
              <span className="volume-percentage">
                {Math.round(voiceVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Stop speaking button */}
          {isSpeaking && (
            <button
              type="button"
              className="voice-control-btn stop-speaking"
              onClick={stopSpeaking}
              title="Stop speaking"
            >
              <Pause size={20} />
            </button>
          )}
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
                  <p className="message-text">{message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}</p>
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

          {/* Voice input button */}
          {speechRecognition && (
            <button
              type="button"
              className={`voice-input-button ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={isTyping}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
          )}

          {/* Text input - using textarea for multiline support */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? '🎤 Listening... Speak now!'
                : t('alita.inputPlaceholder', 'Ask about fashion trends, styling advice...')
            }
            className="chatbot-input"
            disabled={isTyping || isListening}
            rows={1}
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