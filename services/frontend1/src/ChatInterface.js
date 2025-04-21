import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NULogo from './NULogo';
import BotAvatar from './BotAvatar';
import UserAvatar from './UserAvatar';

// Load API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/NuBot';

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
  
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = userInput.trim();
    setMessages(prev => [...prev, { sender: 'user', message: userMessage }]);
    setUserInput('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Make API call to get response
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      // The Flask backend returns the response directly, not wrapped in a field
      setMessages(prev => [...prev, { sender: 'bot', message: data }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        sender: 'bot',
        message: "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
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