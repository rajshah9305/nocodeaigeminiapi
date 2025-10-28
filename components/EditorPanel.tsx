import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { CodeBundle } from '../types';
import { WandSparkles } from 'lucide-react';

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
  const editorRef = useRef<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    onCodeChange({ ...code, [activeTab]: value || '' });
  };
  
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const formatCode = () => {
    editorRef.current?.getAction('editor.action.formatDocument').run();
  };

  const TabButton = ({ type, label }: { type: CodeType, label:string }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`px-4 py-3 text-sm font-medium transition-colors relative ${
        activeTab === type
          ? 'text-primary'
          : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      {label}
       {activeTab === type && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white font-mono overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 flex-shrink-0">
        <div className="flex">
          <TabButton type="html" label="HTML" />
          <TabButton type="css" label="CSS" />
          <TabButton type="javascript" label="JavaScript" />
        </div>
        <button 
          onClick={formatCode}
          className="mr-2 p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          title="Format Code"
        >
          <WandSparkles className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={languageMap[activeTab]}
          value={code[activeTab]}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10 },
          }}
        />
      </div>
    </div>
  );
};
