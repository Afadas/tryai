'use client'
import { useState, useRef } from "react";
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: input };
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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className='w-full min-h-screen bg-gray-100'>
      <div className='flex flex-col items-center justify-start p-4'>
        <h1 className='text-4xl font-bold mb-8'>Hi there, Old pal.</h1>
        
        <div className='w-full max-w-2xl bg-white rounded-lg shadow-md p-4 mb-4 min-h-[400px] flex flex-col'>
          <div className='flex-1 overflow-y-auto mb-4'>
            {messages.map((message, index) => (
              <div key={index} 
                className={`mb-4 p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 ml-auto max-w-[80%]' 
                    : 'bg-gray-100 mr-auto max-w-[80%]'
                }`}>
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className='flex gap-2'>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className='flex-1 p-2 border rounded-lg'
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading}
              className='px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300'
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}