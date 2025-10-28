import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { CodeBundle } from '../types';

interface EditorPanelProps {
  code: CodeBundle;
  onCodeChange: (newCode: CodeBundle) => void;
}

type CodeType = 'html' | 'css' | 'javascript';

const languageMap: Record<CodeType, string> = {
  html: 'html',
  css: 'css',
  javascript: 'javascript',
};

export const EditorPanel: React.FC<EditorPanelProps> = ({ code, onCodeChange }) => {
  const [activeTab, setActiveTab] = useState<CodeType>('html');

  const handleEditorChange = (value: string | undefined) => {
    onCodeChange({ ...code, [activeTab]: value || '' });
  };

  const TabButton = ({ type, label }: { type: CodeType, label: string }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === type
          ? 'border-b-2 border-primary text-primary'
          : 'text-gray-500 hover:text-black'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white font-mono overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-color bg-secondary-bg">
        <div className="flex">
          <TabButton type="html" label="HTML" />
          <TabButton type="css" label="CSS" />
          <TabButton type="javascript" label="JavaScript" />
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={languageMap[activeTab]}
          value={code[activeTab]}
          onChange={handleEditorChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};