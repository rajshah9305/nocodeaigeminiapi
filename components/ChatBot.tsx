import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, BrainCircuit, Trash2, LoaderCircle } from 'lucide-react';
import type { ModelTextMessage, ChatMessage, UserMessage } from '../types';
import { getChatResponse } from '../services/geminiService';

interface ChatBotProps {
    apiKey: string;
    onNoApiKey: () => void;
}

const WelcomeMessage: ModelTextMessage = { 
    id: 'welcome',
    role: 'model',
    text: 'Hello! Ask me anything about web development, or I can help you with general questions.'
};

export const ChatBot: React.FC<ChatBotProps> = ({ apiKey, onNoApiKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([WelcomeMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        if (!apiKey) {
            onNoApiKey();
            setIsOpen(false);
            return;
        }

        const userMessage: UserMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getChatResponse(input, apiKey, isThinkingMode);
            const modelMessage: ModelTextMessage = { 
                id: (Date.now() + 1).toString(), 
                role: 'model', 
                text: responseText,
                isThinking: isThinkingMode 
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error.';
            const errorModelMessage: ModelTextMessage = { id: (Date.now() + 1).toString(), role: 'model', text: errorMessage };
            setMessages(prev => [...prev, errorModelMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the chat history?")) {
            setMessages([WelcomeMessage]);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-40"
                aria-label="Open chat"
            >
                <MessageSquare className="h-6 w-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-40 border border-border-color animate-fade-in">
            <header className="flex items-center justify-between p-3 bg-secondary-bg border-b border-border-color">
                <div className="flex items-center space-x-2">
                    <h2 className="font-bold">AI Assistant</h2>
                    <button 
                        onClick={() => setIsThinkingMode(!isThinkingMode)}
                        title={isThinkingMode ? "Disable Thinking Mode" : "Enable Thinking Mode (uses a more powerful model)"}
                        className={`p-1.5 rounded-md transition-colors ${isThinkingMode ? 'bg-primary/20 text-primary' : 'hover:bg-gray-200'}`}
                    >
                        <BrainCircuit className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex items-center space-x-1">
                     <button onClick={handleClearChat} className="p-1.5 rounded-md hover:bg-gray-200" title="Clear chat" aria-label="Clear chat">
                        <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-gray-200" title="Close chat" aria-label="Close chat">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </header>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                         <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><BrainCircuit className="w-4 h-4 text-primary"/></div>}
                            <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                {'text' in msg ? <p className="text-sm whitespace-pre-wrap">{msg.text}</p> : <p className="text-sm italic text-gray-500">App generation message.</p>}
                            </div>
                            {msg.role === 'model' && 'isThinking' in msg && msg.isThinking && (
                                <div title="Generated with Thinking Mode">
                                <BrainCircuit className="w-4 h-4 text-primary/70 flex-shrink-0" />
                                </div>
                            )}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><BrainCircuit className="w-4 h-4 text-primary"/></div>
                             <div className="max-w-xs px-3 py-2 rounded-lg bg-gray-100 dot-pulse flex space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-3 border-t border-border-color bg-white">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="w-full p-2 pr-12 bg-gray-100 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white h-8 w-8 flex items-center justify-center rounded-full hover:bg-orange-600 disabled:bg-gray-400">
                        {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
