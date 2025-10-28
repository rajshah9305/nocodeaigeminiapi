
import React from 'react';
import { Bot, Download, RefreshCw, Smartphone, Monitor, Maximize } from 'lucide-react';

interface HeaderProps {
  onDownloadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDownloadClick }) => {
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-gray-800 text-gray-100 border-b border-gray-700 flex-shrink-0 z-20">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 p-1.5 rounded-lg">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">RAJ AI App Builder</h1>
      </div>
      <div className="flex items-center space-x-1">
        <button title="Mobile View" className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-300"><Smartphone className="h-5 w-5" /></button>
        <button title="Desktop View" className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-300"><Monitor className="h-5 w-5" /></button>
        <button title="Refresh Preview" className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-300"><RefreshCw className="h-5 w-5" /></button>
        <button title="Fullscreen" className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-300"><Maximize className="h-5 w-5" /></button>
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        <button 
          onClick={onDownloadClick} 
          title="Download Code" 
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
      </div>
    </header>
  );
};
