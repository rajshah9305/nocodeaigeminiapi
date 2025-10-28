
import React, { useState, useEffect } from 'react';
import { Code, Settings, Check, LoaderCircle } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    onApiKeySave(localApiKey);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };
  
  const TabButton = ({ tab, icon, label }: { tab: Tab, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors border-b-2 ${
        activeTab === tab
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <TabButton tab="editor" icon={<Code className="h-4 w-4" />} label="Code Editor" />
        <TabButton tab="settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'editor' && <EditorPanel code={code} onCodeChange={onCodeChange} />}
        {activeTab === 'settings' && (
           <div className="p-6 space-y-6 bg-white h-full text-gray-800">
             <div>
                <h3 className="text-base font-semibold mb-2 text-gray-900">API Settings</h3>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                <p className="text-xs text-gray-500 mb-2">
                Your key is stored securely in your browser's local storage.
                </p>
                <input
                id="apiKey"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your Gemini API Key"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/80"
                />
            </div>
             <button
                onClick={handleSave}
                className={`w-full flex items-center justify-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${saveSuccess && 'bg-green-500 hover:bg-green-600'}`}
                disabled={localApiKey === apiKey || isSaving}
                >
                {isSaving ? (
                  <><LoaderCircle className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
                ) : saveSuccess ? (
                  <><Check className="h-5 w-5 mr-2" /> Saved!</>
                ) : (
                  'Save API Key'
                )}
            </button>
           </div>
        )}
      </div>
    </div>
  );
};
