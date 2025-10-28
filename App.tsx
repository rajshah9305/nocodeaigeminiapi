
import React, { useState, useEffect, useCallback, useRef } from 'react';
import saveAs from 'file-saver';
import { PreviewPanel } from './components/PreviewPanel';
import { Header } from './components/Header';
import { generateAppCode, getChatResponse } from './services/geminiService';
import type { CodeBundle, ChatMessage, UserMessage, ModelResponseMessage, ModelTextMessage } from './types';
import { Bot, Code, LoaderCircle, Send, User, RotateCw, Eye, BrainCircuit } from 'lucide-react';
import { SidePanel } from './components/SidePanel';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCode, setActiveCode] = useState<CodeBundle>({ html: '', css: '', javascript: '' });
  const [activeSources, setActiveSources] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'builder' | 'assistant'>('builder');

  // Panel resizing state and refs
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(window.innerWidth / 2.5);
  const [chatHeight, setChatHeight] = useState<number>(window.innerHeight * 0.3);
  const isResizingHorizontal = useRef(false);
  const isResizingVertical = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
     setMessages([{
        id: 'intro',
        role: 'model',
        text: 'Welcome to the RAJ AI App Builder! Describe the application you want to create in the chat below.'
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

    if (chatMode === 'builder') {
      await handleBuilderMessage(text);
    } else {
      await handleAssistantMessage(text);
    }

    setIsLoading(false);
  };
  
  const handleBuilderMessage = async (text: string) => {
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
    }
  };

  const handleAssistantMessage = async (text: string) => {
    try {
        const responseText = await getChatResponse(text, apiKey, false);
        const modelMessage: ModelTextMessage = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: responseText,
        };
        setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `Sorry, I ran into an error while contacting the assistant: ${errorMessage}`
        }]);
    }
  };

  const handleRegenerate = (prompt: string) => {
    setChatMode('builder');
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

  // Resizing logic
  const handleMouseDownHorizontal = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingHorizontal.current = true;
    document.addEventListener('mousemove', handleMouseMoveHorizontal);
    document.addEventListener('mouseup', handleMouseUpHorizontal);
  };
  const handleMouseMoveHorizontal = (e: MouseEvent) => {
    if (isResizingHorizontal.current && mainPanelRef.current) {
      const newWidth = e.clientX;
      if (newWidth > 300 && newWidth < mainPanelRef.current.clientWidth - 300) {
        setPanelWidth(newWidth);
      }
    }
  };
  const handleMouseUpHorizontal = () => {
    isResizingHorizontal.current = false;
    document.removeEventListener('mousemove', handleMouseMoveHorizontal);
    document.removeEventListener('mouseup', handleMouseUpHorizontal);
  };
  const handleMouseDownVertical = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingVertical.current = true;
    document.addEventListener('mousemove', handleMouseMoveVertical);
    document.addEventListener('mouseup', handleMouseUpVertical);
  };
  const handleMouseMoveVertical = (e: MouseEvent) => {
    if (isResizingVertical.current) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 150 && newHeight < window.innerHeight - 250) {
        setChatHeight(newHeight);
      }
    }
  };
  const handleMouseUpVertical = () => {
    isResizingVertical.current = false;
    document.removeEventListener('mousemove', handleMouseMoveVertical);
    document.removeEventListener('mouseup', handleMouseUpVertical);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans text-gray-800">
      <Header onDownloadClick={handleDownload} />
      
      <main className="flex flex-1 overflow-hidden" ref={mainPanelRef}>
        <div style={{ width: `${panelWidth}px` }} className="overflow-hidden h-full flex-shrink-0 bg-white border-r border-gray-200">
          <SidePanel 
            code={activeCode} 
            onCodeChange={handleCodeChange}
            apiKey={apiKey}
            onApiKeySave={handleApiKeySave}
          />
        </div>
        <div className="resizer" onMouseDown={handleMouseDownHorizontal} />
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            <PreviewPanel html={activeCode.html} css={activeCode.css} javascript={activeCode.javascript} />
            {activeSources.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 overflow-y-auto max-h-28">
                <h3 className="text-xs font-semibold text-gray-500 mb-1.5">Sources from Google Search:</h3>
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
      </main>

      <div className="resizer-horizontal" onMouseDown={handleMouseDownVertical}></div>

      <div style={{ height: `${chatHeight}px` }} className="flex flex-col bg-white border-t border-gray-200">
        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="chat-message-container max-w-4xl mx-auto">
              {msg.role === 'user' ? (
                <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary text-white p-3 rounded-lg max-w-xl shadow-sm">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <div className="bg-primary-light p-2 rounded-full flex-shrink-0"><User className="h-5 w-5 text-primary"/></div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                    <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><Bot className="h-5 w-5 text-gray-600"/></div>
                    <div className="bg-white border border-gray-200 p-3 rounded-lg max-w-xl shadow-sm">
                       {'text' in msg ? <p className="text-sm text-gray-700 leading-relaxed">{msg.text}</p> : (
                           <div>
                            <p className="text-sm text-gray-500 mb-2.5">I've generated an app based on your request:</p>
                            <p className="text-sm font-medium text-gray-800 p-3 bg-gray-50 rounded-md border border-gray-200 mb-3">"{msg.originalPrompt}"</p>
                            <div className="flex space-x-2 mt-2">
                                <button onClick={() => handleSelectApp(msg)} className="flex items-center space-x-1.5 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-medium"><Eye className="h-4 w-4"/><span>View App</span></button>
                                <button onClick={() => handleRegenerate(msg.originalPrompt)} className="flex items-center space-x-1.5 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors font-medium"><RotateCw className="h-4 w-4"/><span>Regenerate</span></button>
                            </div>
                           </div>
                       )}
                    </div>
                </div>
              )}
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start gap-3 max-w-4xl mx-auto">
                <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><Bot className="h-5 w-5 text-gray-600"/></div>
                <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-1 dot-pulse">
                    <span className="h-2 w-2 bg-gray-500 rounded-full"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full"></span>
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
           {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-3 text-sm max-w-4xl mx-auto">
              <p>{error}</p>
            </div>
          )}
          <div className="relative max-w-4xl mx-auto">
             <div className="flex items-center space-x-2 mb-2">
                <button 
                    onClick={() => setChatMode('builder')}
                    className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-full transition-colors ${chatMode === 'builder' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                    <Code className="h-4 w-4" />
                    <span>App Builder</span>
                </button>
                <button 
                    onClick={() => setChatMode('assistant')}
                    className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-full transition-colors ${chatMode === 'assistant' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                    <BrainCircuit className="h-4 w-4" />
                    <span>AI Assistant</span>
                </button>
            </div>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(chatInput);
                  }
              }}
              placeholder={chatMode === 'builder' ? 'Describe the app you want to build... (Shift+Enter for new line)' : 'Ask the AI assistant anything... (Shift+Enter for new line)'}
              className="w-full p-3 pr-14 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/80 transition-all resize-none"
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button
              onClick={() => handleSendMessage(chatInput)}
              disabled={isLoading || !chatInput}
              className="absolute right-2 bottom-2 bg-primary text-white h-9 w-9 flex items-center justify-center rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
