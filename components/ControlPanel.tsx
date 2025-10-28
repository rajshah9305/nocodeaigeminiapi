
import React, { useState } from 'react';
import { Code, Settings, LoaderCircle, Image, ScanEye } from 'lucide-react';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  apiKey: string;
  onApiKeySave: (apiKey: string) => void;
  onGenerate: () => void;
  onGenerateImage: (prompt: string) => void;
  onAnalyzeContent: (prompt: string, file: File) => void;
  isLoading: boolean;
  generationMode: 'standard' | 'thinking' | 'search';
  setGenerationMode: (mode: 'standard' | 'thinking' | 'search') => void;
}

type Tab = 'app' | 'image' | 'analyze' | 'settings';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  prompt,
  setPrompt,
  apiKey,
  onApiKeySave,
  onGenerate,
  onGenerateImage,
  onAnalyzeContent,
  isLoading,
  generationMode,
  setGenerationMode,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('app');
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  // State for other tabs
  const [imagePrompt, setImagePrompt] = useState('');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);

  const handleSave = () => {
    onApiKeySave(localApiKey);
    alert('API Key saved!');
  };

  const TabButton = ({ tab, icon, label }: { tab: Tab, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-shrink-0 flex items-center space-x-2 p-2 rounded-md transition-colors text-sm ${
        activeTab === tab ? 'bg-primary text-white' : 'hover:bg-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const renderAppTab = () => (
     <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-2">Describe Your App</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use natural language to describe the web application you want to build.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A simple to-do list app with a field to add tasks and a button to mark them as complete."
          className="w-full flex-1 p-2 border border-border-color rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Generation Mode</h3>
            <div className="flex space-x-4 text-sm">
                <label className="flex items-center"><input type="radio" name="mode" value="standard" checked={generationMode === 'standard'} onChange={() => setGenerationMode('standard')} className="mr-1 accent-primary"/> Standard</label>
                <label className="flex items-center"><input type="radio" name="mode" value="thinking" checked={generationMode === 'thinking'} onChange={() => setGenerationMode('thinking')} className="mr-1 accent-primary"/> Thinking</label>
                <label className="flex items-center"><input type="radio" name="mode" value="search" checked={generationMode === 'search'} onChange={() => setGenerationMode('search')} className="mr-1 accent-primary"/> Search</label>
            </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {isLoading ? <><LoaderCircle className="animate-spin h-5 w-5 mr-2" /> Generating...</> : 'Generate Application'}
        </button>
    </div>
  );

  const renderImageTab = () => (
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-2">Generate an Image</h2>
        <p className="text-sm text-gray-600 mb-4">
            Describe the image you want to create.
        </p>
        <textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="e.g., A photorealistic image of a cat wearing a tiny wizard hat."
          className="w-full flex-1 p-2 border border-border-color rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() => onGenerateImage(imagePrompt)}
          disabled={isLoading}
          className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {isLoading ? <><LoaderCircle className="animate-spin h-5 w-5 mr-2" /> Generating...</> : 'Generate Image'}
        </button>
      </div>
  );

  const renderAnalyzeTab = () => (
      <div className="flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-2">Analyze Content</h2>
          <p className="text-sm text-gray-600 mb-4">
              Upload an image or video and ask a question about it.
          </p>
          <textarea
              value={analysisPrompt}
              onChange={(e) => setAnalysisPrompt(e.target.value)}
              placeholder="e.g., What is the main subject of this image?"
              className="w-full h-24 p-2 border border-border-color rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          />
          <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setAnalysisFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          <button
              onClick={() => analysisFile && onAnalyzeContent(analysisPrompt, analysisFile)}
              disabled={isLoading || !analysisFile || !analysisPrompt}
              className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
              {isLoading ? <><LoaderCircle className="animate-spin h-5 w-5 mr-2" /> Analyzing...</> : 'Analyze Content'}
          </button>
      </div>
  );

  const renderSettingsTab = () => (
    <div>
        <h2 className="text-lg font-semibold mb-2">API Key</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter your Gemini API key. It will be stored securely in your browser's local storage.
        </p>
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          placeholder="Enter your Gemini API Key"
          className="w-full p-2 border border-border-color rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSave}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
        >
          Save API Key
        </button>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-secondary-bg text-black overflow-y-auto">
      <div className="flex p-2 space-x-2 border-b border-border-color overflow-x-auto">
        <TabButton tab="app" icon={<Code className="h-5 w-5" />} label="App" />
        <TabButton tab="image" icon={<Image className="h-5 w-5" />} label="Image" />
        <TabButton tab="analyze" icon={<ScanEye className="h-5 w-5" />} label="Analyze" />
        <TabButton tab="settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {activeTab === 'app' && renderAppTab()}
        {activeTab === 'image' && renderImageTab()}
        {activeTab === 'analyze' && renderAnalyzeTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};
