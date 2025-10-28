
import React, { useState, useEffect } from 'react';
import { Code, Settings } from 'lucide-react';
import { EditorPanel } from './EditorPanel';
import type { CodeBundle } from '../types';

interface SidePanelProps {
  code: CodeBundle;
  onCodeChange: (newCode: CodeBundle) => void;
  apiKey: string;
  onApiKeySave: (apiKey: string) => void;
}

type Tab = 'editor' | 'settings';

export const SidePanel: React.FC<SidePanelProps> = ({ code, onCodeChange, apiKey, onApiKeySave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onApiKeySave(localApiKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };
  
  const TabButton = ({ tab, icon, label }: { tab: Tab, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium transition-colors border-b-2 ${
        activeTab === tab
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-secondary-bg overflow-hidden">
      <div className="flex border-b border-border-color">
        <TabButton tab="editor" icon={<Code className="h-5 w-5" />} label="Code Editor" />
        <TabButton tab="settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'editor' && <EditorPanel code={code} onCodeChange={onCodeChange} />}
        {activeTab === 'settings' && (
           <div className="p-6 space-y-4 bg-white h-full">
             <div>
                <h3 className="text-lg font-bold mb-2">API Settings</h3>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                <p className="text-xs text-gray-500 mb-2">
                Your key is stored securely in your browser's local storage and is never sent to our servers.
                </p>
                <input
                id="apiKey"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your Gemini API Key"
                className="w-full p-2 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
             <button
                onClick={handleSave}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                disabled={localApiKey === apiKey || !localApiKey}
                >
                {saveSuccess ? 'Saved!' : 'Save API Key'}
            </button>
           </div>
        )}
      </div>
    </div>
  );
};
