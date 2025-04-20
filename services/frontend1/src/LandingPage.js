import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NULogo from './NULogo'; // Import the same logo component used in ChatInterface
import BotAvatar from './BotAvatar';
import UserAvatar from './UserAvatar';

// Import SVG icons for tools
import GCPIcon from './assets/gcp.svg';
import MistralIcon from './assets/mistralai.svg';
import DockerIcon from './assets/docker.svg';
import MLflowIcon from './assets/mlflow.svg';
import PrefectIcon from './assets/prefect.svg';
import GitIcon from './assets/git.svg';

// Import custom message icon
import MessageIcon from './assets/imessage.svg';
import BotIcon from './assets/boticon1.svg'; // Import the bot icon

// Using your existing illustration
import StudentIllustration from './assets/landingpageimage.svg';

const TOOLS = [
  {
    name: 'GCP Cloud Run',
    icon: GCPIcon,
    description: 'Offers reliable cloud hosting for our services'
  },
  {
    name: 'Mistral API',
    icon: MistralIcon,
    description: 'Powers the LLM inference for natural-language responses.'
  },
  {
    name: 'Docker',
    icon: DockerIcon,
    description: 'Containerizes each service for consistent deployment.'
  },
  {
    name: 'MLflow',
    icon: MLflowIcon,
    description: 'Tracks experiments and manages our model registry.'
  },
  {
    name: 'Prefect',
    icon: PrefectIcon,
    description: 'Orchestrates data pipelines and retraining workflows.'
  },
  {
    name: 'Git',
    icon: GitIcon,
    description: 'Version-controls our code and CI/CD pipelines.'
  }
];

// Sample chat responses for the demo widget
const DEMO_RESPONSES = {
  "hello": "Hi there! I'm NUBot. How can I help you with Northeastern University information today?",
  "hi": "Hello! I'm NUBot, your Northeastern University assistant. What information can I help you find?",
  "courses": "Northeastern offers a wide range of courses across various disciplines. Are you looking for courses in a specific department or program?",
  "faculty": "Northeastern has renowned faculty members across all colleges. Which department or professor are you interested in learning about?",
  "campus": "Northeastern's main campus is located in Boston, MA. We also have regional campuses in Charlotte, Seattle, San Francisco, Vancouver, Portland ME, and more. Which campus would you like to know more about?",
  "about": "I'm NUBot, an AI assistant designed to help you navigate Northeastern University information more easily. I can answer questions about courses, faculty, campus resources, and more!",
  "help": "I can help you find information about Northeastern's academic programs, faculty, campus resources, student services, and more. What would you like to know?",
};

// Typing indicator component
const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

// Welcome message component with inline design
const WelcomeMessage = ({ onExpand }) => {
  return (
    <div className="welcome-message" onClick={onExpand}>
      <div className="welcome-bubble">
        {/* Removed the image/icon */}
        <div className="welcome-text">
          • Hi, I'm Paws! How may I help you?
        </div>
      </div>
    </div>
  );
};

const ChatWidget = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', message: "Hi, I'm Paws! How may I help you?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef(null);

  // Scroll to bottom of chat when messages change
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

    // Process response with delay
    setTimeout(() => {
      const lowerCaseInput = userMessage.toLowerCase();
      let botResponse = "I'm here to help with anything related to Northeastern University. For more detailed assistance, please use the full chat experience by clicking 'Ask NUBot'!";
      
      // Check for keyword matches
      for (const [keyword, response] of Object.entries(DEMO_RESPONSES)) {
        if (lowerCaseInput.includes(keyword)) {
          botResponse = response;
          break;
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', message: botResponse }]);
      setIsLoading(false);
    }, 1500); // Simulated processing time
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-widget-header">
        <div className="chat-widget-title">
          <div className="nubot-logo-small">
            <span className="nu">NU</span>
            <span className="bot">Bot</span>
          </div>
        </div>
        <div className="chat-widget-controls">
          <button className="widget-control-btn close" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="chat-widget-messages" ref={chatAreaRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`widget-message ${msg.sender}`}>
            {msg.sender === 'bot' && <div className="avatar bot-avatar"><BotAvatar /></div>}
            <div className="bubble">{msg.message}</div>
            {msg.sender === 'user' && <div className="avatar user-avatar"><UserAvatar /></div>}
          </div>
        ))}
        
        {/* Typing indicator with bot avatar */}
        {isLoading && (
          <div className="widget-message bot">
            <div className="avatar bot-avatar"><BotAvatar /></div>
            <div className="bubble loading-bubble">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
      
      <div className="chat-widget-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          className="widget-message-input"
          disabled={isLoading}
        />
        <button 
          className={`widget-send-btn ${isLoading ? 'disabled' : ''}`}
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
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const aboutUsRef = useRef(null);
  const contactRef = useRef(null);
  
  // State for Try It Out feature
  const [tryItOutActive, setTryItOutActive] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);

  const handleStart = () => {
    navigate('/chat');
  };
  
  const handleNavigation = (ref) => {
    // Scroll to the referenced section
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleTryItOut = () => {
    setTryItOutActive(true);
    // Show welcome message after a short delay
    setTimeout(() => {
      setShowWelcomeMessage(true);
    }, 300);
  };
  
  const handleWelcomeClick = () => {
    setShowWelcomeMessage(false);
    setShowChatWidget(true);
  };
  
  const handleBotIconClick = () => {
    setShowWelcomeMessage(false);
    setShowChatWidget(true);
  };
  
  const handleCloseChat = () => {
    setShowChatWidget(false);
    setShowWelcomeMessage(false);
    setTryItOutActive(false);
  };

  return (
    <div className="landing-container">
      {/* New Navigation Header */}
      <div className="landing-header">
        <div className="landing-header-left">
          <NULogo />
        </div>
        <div className="landing-header-right">
          <nav className="landing-nav">
            <button 
              className={`nav-link try-it-out ${tryItOutActive ? 'active' : ''}`}
              onClick={handleTryItOut}
            >
              Try It Out
            </button>
            <button 
              className="nav-link" 
              onClick={() => handleNavigation(aboutUsRef)}
            >
              About Us
            </button>
            <button 
              className="nav-link" 
              onClick={() => handleNavigation(contactRef)}
            >
              Contact
            </button>
          </nav>
        </div>
      </div>

      {/* Modern hero section with larger illustration */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-logo">
            <span className="nu">NU</span>
            <span className="bot">Bot</span>
            <img src={MessageIcon} alt="Message" className="chat-icon" />
          </div>
          
          <h2 className="hero-subtitle">
          Navigate Northeastern with AI-powered assistance
          </h2>
          
          <button className="start-chatting-button" onClick={handleStart}>
          Ask NUBot <span className="arrow">→</span>
          </button>
          
          <p className="hero-description">
          Designed by Huskies, for Huskies. NUBot provides instant answers to your questions about campus, courses, faculty details, and resources.
          </p>
        </div>
        
        <div className="hero-illustration">
          <img 
            src={StudentIllustration} 
            alt="Student with husky" 
            className="student-image" 
          />
        </div>
      </div>

      {/* Tools section with grid layout - MOVED UP */}
      <section className="tools-section">
        <h2 className="tools-header">Powered by</h2>
        <div className="tools-container">
          {TOOLS.map((tool) => (
            <div className="tool-card" key={tool.name}>
              <img src={tool.icon} alt={tool.name} className="tool-icon" />
              <h3 className="tool-name">{tool.name}</h3>
              <p className="tool-desc">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section - MOVED DOWN */}
      <section className="about-us-section" ref={aboutUsRef}>
        <h2 className="about-us-header">About Us</h2>
        <div className="about-us-content">
          <div className="about-us-text">
            <h3>Our Mission</h3>
            <p>
              At NUBot, we understand the challenges students face when navigating complex university websites. 
              Our team experienced these frustrations firsthand, often spending hours searching for 
              information about courses, faculty, and campus resources.
            </p>
            <p>
              That's why we created NUBot - an AI-powered assistant specifically trained on Northeastern 
              University information to help students, faculty, and visitors quickly find what they need.
            </p>
            <h3>How NUBot Helps</h3>
            <ul className="about-us-list">
              <li>Get instant answers about Northeastern's academic programs</li>
              <li>Find detailed faculty information and office hours</li>
              <li>Navigate campus resources and facilities</li>
              <li>Learn about student services and support options</li>
              <li>Get help with course selection and registration</li>
            </ul>
            <p>
              Our goal is to save you time and make university information more accessible. Whether you're a 
              prospective student, current Husky, or faculty member, NUBot is here to assist you with accurate 
              and helpful information about Northeastern University.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section (Placeholder) */}
      <section className="contact-section" ref={contactRef}>
        <h2 className="contact-header">Contact Us</h2>
        <div className="contact-content">
          <p className="contact-text">
            Have questions, suggestions, or feedback? We'd love to hear from you!
          </p>
          <p className="contact-email">
            Email us: <a href="mailto:nubot@northeastern.edu">nubot@northeastern.edu</a>
          </p>
          <div className="team-info">
            <p>NUBot Team</p>
            <p>Khoury College of Computer Science</p>
            <p>Northeastern University</p>
            <p>Boston, MA</p>
          </div>
        </div>
      </section>

      {/* Thank you note - UPDATED TO BE BOLD */}
      <div className="thank-you">
        <strong>Thank you, Professor Mohammadi Ramin, for guiding us through this course.</strong>
      </div>

      {/* Footer copyright */}
      <div className="footer">
        © {new Date().getFullYear()} Northeastern University
      </div>
      
      {/* Bot Icon for Try It Out */}
      {tryItOutActive && (
        <div className="bot-icon-container" onClick={handleBotIconClick}>
          <img src={BotIcon} alt="Chat with NUBot" className="bot-icon" />
        </div>
      )}
      
      {/* Welcome Message Bubble */}
      {tryItOutActive && showWelcomeMessage && !showChatWidget && (
        <WelcomeMessage onExpand={handleWelcomeClick} />
      )}
      
      {/* Chat Widget */}
      {tryItOutActive && showChatWidget && (
        <ChatWidget onClose={handleCloseChat} />
      )}
    </div>
  );
};

export default LandingPage;