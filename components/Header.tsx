import React from 'react';
import { FileArchive, BrainCircuit } from 'lucide-react';

interface HeaderProps {
    onDownload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDownload }) => {
    return (
        <header className="flex items-center justify-between p-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
                <BrainCircuit className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-bold text-gray-800">RAJ AI App Builder</h1>
            </div>
            <button
                onClick={onDownload}
                className="flex items-center space-x-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
                <FileArchive className="h-4 w-4" />
                <span>Download ZIP</span>
            </button>
        </header>
    );
};