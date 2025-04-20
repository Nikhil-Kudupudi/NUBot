import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NULogo from './NULogo';
import BotAvatar from './BotAvatar';
import UserAvatar from './UserAvatar';

// Sample chat responses for the full chat interface
const CHAT_RESPONSES = {
  "hello": "Hi there! I'm NUBot. How can I help you with Northeastern University information today?",
  "hi": "Hello! I'm NUBot, your Northeastern University assistant. What information can I help you find?",
  "courses": "Northeastern offers a wide range of courses across various disciplines. Are you looking for courses in a specific department or program?",
  "faculty": "Northeastern has renowned faculty members across all colleges. Which department or professor are you interested in learning about?",
  "campus": "Northeastern's main campus is located in Boston, MA. We also have regional campuses in Charlotte, Seattle, San Francisco, Vancouver, Portland ME, and more. Which campus would you like to know more about?",
  "about": "I'm NUBot, an AI assistant designed to help you navigate Northeastern University information more easily. I can answer questions about courses, faculty, campus resources, and more!",
  "help": "I can help you find information about Northeastern's academic programs, faculty, campus resources, student services, and more. What would you like to know?",
  "admission": "Northeastern has different application processes for undergraduate, graduate, and professional programs. Would you like information about a specific program's admission requirements?",
  "events": "Northeastern hosts various events and activities throughout the year. You can check the university calendar or specific department pages for upcoming events. Is there a particular type of event you're interested in?",
  "registration": "Course registration typically opens several months before the start of each semester. The exact dates depend on your student status and program. Would you like to know more about the registration process?",
  "housing": "Northeastern offers various on-campus housing options for students, from traditional residence halls to apartment-style accommodations. Off-campus housing resources are also available through the university. Would you like specific information about housing options?",
};

// Typing indicator component that uses the three dots
const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

// This is a proper ChatInterface component for the /chat route
const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'bot', message: "Hi there! I'm NUBot, your Northeastern University assistant. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef(null);
  
  // Scroll to bottom of chat area when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]); // Also scroll when loading state changes
  
  const handleSendMessage = () => {
    if (!userInput.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = userInput.trim();
    setMessages(prev => [...prev, { sender: 'user', message: userMessage }]);
    setUserInput('');
    
    // Set loading state
    setIsLoading(true);
    
    // Process bot response with delay to simulate thinking/processing
    setTimeout(() => {
      const lowerCaseInput = userMessage.toLowerCase();
      let botResponse = "I'm here to help with anything related to Northeastern University. What else would you like to know?";
      
      // Check for keyword matches
      for (const [keyword, response] of Object.entries(CHAT_RESPONSES)) {
        if (lowerCaseInput.includes(keyword)) {
          botResponse = response;
          break;
        }
      }
      
      setMessages(prev => [...prev, { sender: 'bot', message: botResponse }]);
      setIsLoading(false);
    }, 1500); // Delay to simulate processing - adjust as needed
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleExitChat = () => {
    navigate('/');
  };
  
  return (
    <div className="chat-container">
      {/* Header */}
      <div className="header">
        <div className="nubot-logo-header">
          <span className="nu">NU</span>
          <span className="bot">Bot</span>
        </div>
        <div className="header-right">
          <NULogo />
        </div>
      </div>
      
      {/* Chat area */}
      <div className="chat-area" ref={chatAreaRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' && <div className="bot-avatar"><BotAvatar /></div>}
            <div className="bubble">{msg.message}</div>
            {msg.sender === 'user' && <div className="user-avatar"><UserAvatar /></div>}
          </div>
        ))}
        
        {/* Typing indicator with bot avatar */}
        {isLoading && (
          <div className="message bot">
            <div className="bot-avatar"><BotAvatar /></div>
            <div className="bubble loading-bubble">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="input-container">
        <div className="input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-input"
            disabled={isLoading}
          />
          <button 
            className={`input-action-btn ${isLoading ? 'disabled' : ''}`} 
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Footer with exit button */}
      <div className="chat-footer">
        <button className="exit-btn" onClick={handleExitChat}>
          Exit Chat
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;