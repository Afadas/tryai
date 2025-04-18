'use client'
import { useState, useRef, useEffect } from "react";
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [opacity, setOpacity] = useState({});
  const [visibility, setVisibility] = useState({});
  const [fadeTimers, setFadeTimers] = useState({});
  const [currentBackground, setCurrentBackground] = useState('standby.png');
  const [hasServed, setHasServed] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clear existing timers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(fadeTimers).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, [fadeTimers]);

  const resetAllFadeTimers = () => {
    // Clear all existing timers
    Object.values(fadeTimers).forEach(timer => {
      clearTimeout(timer);
    });

    // Reset opacity and start new timers for all messages
    setOpacity({});
    const newTimers = {};

    messages.forEach((_, index) => {
      const timer = setTimeout(() => {
        setOpacity(prev => ({
          ...prev,
          [index]: true
        }));

        setTimeout(() => {
          setVisibility(prev => ({
            ...prev,
            [index]: false
          }));
        }, 1000);
      }, 10000);

      newTimers[index] = timer;
    });

    setFadeTimers(newTimers);
  };

  const startFadeTimer = (index) => {
    // Clear existing timer for this index if it exists
    if (fadeTimers[index]) {
      clearTimeout(fadeTimers[index]);
    }

    // Set new timer
    const timer = setTimeout(() => {
      setOpacity(prev => ({
        ...prev,
        [index]: true
      }));
      
      // Then remove the message box after fade animation completes
      setTimeout(() => {
        setVisibility(prev => ({
          ...prev,
          [index]: false
        }));
        // Clear timer reference
        setFadeTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[index];
          return newTimers;
        });
      }, 1000);
    }, 10000);

    // Store timer reference
    setFadeTimers(prev => ({
      ...prev,
      [index]: timer
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: input };
    const newIndex = messages.length;
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/word-gen', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input })
      });

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.text };
      setMessages(prev => [...prev, aiMessage]);
      
      // Reset fade timers for all messages after AI responds
      resetAllFadeTimers();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Add effect to check messages for keywords and update background
  useEffect(() => {
    if (messages.length === 0) {
      setCurrentBackground('standby.png');
      setHasServed(false);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.content.toLowerCase().includes('shaking')) {
      setCurrentBackground('shaking.gif');
      setHasServed(false);
    } else if (lastMessage.content.toLowerCase().includes('serving')) {
      setCurrentBackground('serf.gif');
      // Set timer to mark serving as complete
      setTimeout(() => {
        setHasServed(true);
      }, 3000); // Adjust this timing based on your serf.gif duration
    } else if (lastMessage.role === 'user' && hasServed) {
      setCurrentBackground('after.png');
    }
  }, [messages, hasServed]);

  return (
    <div className='relative w-full min-h-screen'>
      {/* Dynamic Background Image */}
      <Image
        src={`/images/${currentBackground}`}
        alt="Background"
        fill
        className="object-cover transition-opacity duration-500"
        priority
      />

      {/* Content Overlay */}
      <div className='relative z-10 flex flex-col min-h-screen'>
        {/* Chat Messages Area with Fade Effect */}
        <div className='flex-1 overflow-hidden ml-[75%]'>
          <div className='h-full overflow-y-auto px-4 pb-24'>
            {messages.map((message, index) => (
              visibility[index] !== false && (
                <div 
                  key={index} 
                  className={`mb-4 p-3 rounded-lg transition-all duration-[10000ms] ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-t from-black to-white ml-auto max-w-[70%]' 
                      : 'bg-gradient-to-t from-white to-black mr-auto max-w-[70%]'
                  } ${
                    opacity[index] ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div className={`font-semibold ${
                    message.role === 'user'
                      ? 'text-transparent bg-clip-text bg-gradient-to-b from-black to-white'
                      : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-black'
                  }`}>
                    {message.content}
                  </div>
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input Fixed at Bottom */}
        <div className='fixed bottom-0 left-0 w-full p-4'>
          <form onSubmit={handleSubmit} className='max-w-2xl mx-auto flex gap-2'>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className='flex-1 p-4 rounded-full bg-gradient-to-t from-black to-white text-transparent bg-clip-text border-0 shadow-lg placeholder:text-gray-500'
              style={{
                WebkitTextFillColor: 'white',
                caretColor: 'black'
              }}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading}
              className='px-6 py-4 rounded-full bg-gradient-to-t from-white to-black hover:from-black hover:to-white transition-all duration-300 shadow-lg disabled:from-gray-300 disabled:to-gray-100'
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-white">
                {loading ? 'Sending...' : 'Send'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}'use client'
import { useState, useRef, useEffect } from "react";
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [opacity, setOpacity] = useState({});
  const [visibility, setVisibility] = useState({});
  const [fadeTimers, setFadeTimers] = useState({});
  const [currentBackground, setCurrentBackground] = useState('standby.png');
  const [hasServed, setHasServed] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clear existing timers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(fadeTimers).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, [fadeTimers]);

  const resetAllFadeTimers = () => {
    // Clear all existing timers
    Object.values(fadeTimers).forEach(timer => {
      clearTimeout(timer);
    });

    // Reset opacity and start new timers for all messages
    setOpacity({});
    const newTimers = {};

    messages.forEach((_, index) => {
      const timer = setTimeout(() => {
        setOpacity(prev => ({
          ...prev,
          [index]: true
        }));

        setTimeout(() => {
          setVisibility(prev => ({
            ...prev,
            [index]: false
          }));
        }, 1000);
      }, 10000);

      newTimers[index] = timer;
    });

    setFadeTimers(newTimers);
  };

  const startFadeTimer = (index) => {
    // Clear existing timer for this index if it exists
    if (fadeTimers[index]) {
      clearTimeout(fadeTimers[index]);
    }

    // Set new timer
    const timer = setTimeout(() => {
      setOpacity(prev => ({
        ...prev,
        [index]: true
      }));
      
      // Then remove the message box after fade animation completes
      setTimeout(() => {
        setVisibility(prev => ({
          ...prev,
          [index]: false
        }));
        // Clear timer reference
        setFadeTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[index];
          return newTimers;
        });
      }, 1000);
    }, 10000);

    // Store timer reference
    setFadeTimers(prev => ({
      ...prev,
      [index]: timer
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: input };
    const newIndex = messages.length;
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/word-gen', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input })
      });

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.text };
      setMessages(prev => [...prev, aiMessage]);
      
      // Reset fade timers for all messages after AI responds
      resetAllFadeTimers();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Add effect to check messages for keywords and update background
  useEffect(() => {
    if (messages.length === 0) {
      setCurrentBackground('standby.png');
      setHasServed(false);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.content.toLowerCase().includes('shaking')) {
      setCurrentBackground('shaking.gif');
      setHasServed(false);
    } else if (lastMessage.content.toLowerCase().includes('serving')) {
      setCurrentBackground('serf.gif');
      // Set timer to mark serving as complete
      setTimeout(() => {
        setHasServed(true);
      }, 3000); // Adjust this timing based on your serf.gif duration
    } else if (lastMessage.role === 'user' && hasServed) {
      setCurrentBackground('after.png');
    }
  }, [messages, hasServed]);

  return (
    <div className='relative w-full min-h-screen'>
      {/* Dynamic Background Image */}
      <Image
        src={`/images/${currentBackground}`}
        alt="Background"
        fill
        className="object-cover transition-opacity duration-500"
        priority
      />

      {/* Content Overlay */}
      <div className='relative z-10 flex flex-col min-h-screen'>
        {/* Chat Messages Area with Fade Effect */}
        <div className='flex-1 overflow-hidden ml-[75%]'>
          <div className='h-full overflow-y-auto px-4 pb-24'>
            {messages.map((message, index) => (
              visibility[index] !== false && (
                <div 
                  key={index} 
                  className={`mb-4 p-3 rounded-lg transition-all duration-[10000ms] ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-t from-black to-white ml-auto max-w-[70%]' 
                      : 'bg-gradient-to-t from-white to-black mr-auto max-w-[70%]'
                  } ${
                    opacity[index] ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div className={`font-semibold ${
                    message.role === 'user'
                      ? 'text-transparent bg-clip-text bg-gradient-to-b from-black to-white'
                      : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-black'
                  }`}>
                    {message.content}
                  </div>
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input Fixed at Bottom */}
        <div className='fixed bottom-0 left-0 w-full p-4'>
          <form onSubmit={handleSubmit} className='max-w-2xl mx-auto flex gap-2'>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className='flex-1 p-4 rounded-full bg-gradient-to-t from-black to-white text-transparent bg-clip-text border-0 shadow-lg placeholder:text-gray-500'
              style={{
                WebkitTextFillColor: 'white',
                caretColor: 'black'
              }}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading}
              className='px-6 py-4 rounded-full bg-gradient-to-t from-white to-black hover:from-black hover:to-white transition-all duration-300 shadow-lg disabled:from-gray-300 disabled:to-gray-100'
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-white">
                {loading ? 'Sending...' : 'Send'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}