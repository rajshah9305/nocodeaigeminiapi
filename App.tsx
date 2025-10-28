
import React, { useState, useEffect, useCallback, useRef } from 'react';
import saveAs from 'file-saver';
import { PreviewPanel } from './components/PreviewPanel';
import { Header } from './components/Header';
import { generateAppCode } from './services/geminiService';
import type { CodeBundle, ChatMessage, UserMessage, ModelResponseMessage } from './types';
import { Bot, Code, LoaderCircle, Send, User, RotateCw, Eye } from 'lucide-react';
import { ChatBot } from './components/ChatBot';
import { SidePanel } from './components/SidePanel';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCode, setActiveCode] = useState<CodeBundle>({ html: '', css: '', javascript: '' });
  const [activeSources, setActiveSources] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Panel resizing state and refs
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(window.innerWidth / 2.5);
  const isResizing = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
     setMessages([{
        id: 'intro',
        role: 'model',
        text: 'Welcome to the AI Web App Builder! Describe the application you want to create in the chat below.'
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleApiKeySave = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('geminiApiKey', newApiKey);
  };

  const onNoApiKey = () => {
    setError('Please set your Gemini API key in the Settings tab.');
  };

  const handleSendMessage = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isLoading) return;
    if (!apiKey) {
      onNoApiKey();
      return;
    }

    const userMessage: UserMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);
    setError(null);
    setActiveSources([]);

    try {
      const { code: generatedCode, sources } = await generateAppCode(text, apiKey);
      const modelMessage: ModelResponseMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        code: generatedCode,
        sources,
        originalPrompt: text,
      };
      setMessages(prev => [...prev, modelMessage]);
      setActiveCode(generatedCode);
      if (sources) setActiveSources(sources);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
       setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `Sorry, I ran into an error: ${errorMessage}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerate = (prompt: string) => {
    handleSendMessage(prompt);
  }

  const handleSelectApp = (message: ModelResponseMessage) => {
    setActiveCode(message.code);
    setActiveSources(message.sources || []);
  };
  
  const handleCodeChange = useCallback((newCode: CodeBundle) => {
    setActiveCode(newCode);
  }, []);

  const handleDownload = () => {
    const htmlBlob = new Blob([activeCode.html], { type: 'text/html;charset=utf-8' });
    saveAs(htmlBlob, 'index.html');
    const cssBlob = new Blob([activeCode.css], { type: 'text/css;charset=utf-8' });
    saveAs(cssBlob, 'style.css');
    const jsBlob = new Blob([activeCode.javascript], { type: 'application/javascript;charset=utf-8' });
    saveAs(jsBlob, 'script.js');
  };

  // Panel resizing logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current && mainPanelRef.current) {
      const newWidth = e.clientX;
      if (newWidth > 300 && newWidth < mainPanelRef.current.clientWidth - 300) {
        setPanelWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-black">
      <Header onDownloadClick={handleDownload} />
      
      <div className="flex flex-1 overflow-hidden" ref={mainPanelRef}>
        <div style={{ width: `${panelWidth}px` }} className="overflow-hidden h-full flex-shrink-0">
          <SidePanel 
            code={activeCode} 
            onCodeChange={handleCodeChange}
            apiKey={apiKey}
            onApiKeySave={handleApiKeySave}
          />
        </div>
        <div className="resizer" onMouseDown={handleMouseDown} />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <PreviewPanel html={activeCode.html} css={activeCode.css} javascript={activeCode.javascript} />
            {activeSources.length > 0 && (
              <div className="p-3 border-t border-border-color bg-secondary-bg overflow-y-auto max-h-24">
                <h3 className="text-xs font-bold mb-1.5">Sources from Google Search:</h3>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {activeSources.map((source, index) => (
                    <li key={index}>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {source.web.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>

      <div className="border-t border-border-color">
        <div className="bg-secondary-bg p-4 overflow-y-auto max-h-60 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="chat-message-container">
              {msg.role === 'user' ? (
                <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary text-white p-3 rounded-lg max-w-xl">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full"><User className="h-5 w-5 text-gray-600"/></div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full"><Bot className="h-5 w-5 text-primary"/></div>
                    <div className="bg-gray-100 p-3 rounded-lg max-w-xl">
                       {'text' in msg ? <p>{msg.text}</p> : (
                           <div>
                            <p className="text-sm text-gray-600 mb-2">I've generated an app based on your prompt: <strong>"{msg.originalPrompt}"</strong></p>
                            <div className="flex space-x-2 mt-2">
                                <button onClick={() => handleSelectApp(msg)} className="flex items-center space-x-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20 transition-colors"><Eye className="h-4 w-4"/><span>View App</span></button>
                                <button onClick={() => handleRegenerate(msg.originalPrompt)} className="flex items-center space-x-1 text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"><RotateCw className="h-4 w-4"/><span>Regenerate</span></button>
                            </div>
                           </div>
                       )}
                    </div>
                </div>
              )}
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full"><Bot className="h-5 w-5 text-primary"/></div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-1 dot-pulse">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 bg-white border-t border-border-color">
           {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-3 text-sm">
              <p>{error}</p>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
              placeholder="Describe the app you want to build..."
              className="w-full p-3 pr-14 bg-secondary-bg border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(chatInput)}
              disabled={isLoading || !chatInput}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white h-10 w-10 flex items-center justify-center rounded-full hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <ChatBot apiKey={apiKey} onNoApiKey={onNoApiKey} />
    </div>
  );
};

export default App;
