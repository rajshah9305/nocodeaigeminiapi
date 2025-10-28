
import React from 'react';
import { Bot, Download } from 'lucide-react';

interface HeaderProps {
  onDownloadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDownloadClick }) => {
  return (
    <header className="flex items-center justify-between p-3 border-b border-border-color bg-secondary-bg text-black z-10">
      <div className="flex items-center space-x-2">
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold">AI Web App Builder</h1>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={onDownloadClick} title="Download Code" className="p-2 rounded-md hover:bg-gray-200 transition-colors">
            <Download className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
};
