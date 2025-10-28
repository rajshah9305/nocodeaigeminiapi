import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onApiKeySave: (apiKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onApiKeySave }) => {
    const [localApiKey, setLocalApiKey] = useState(apiKey);

    useEffect(() => {
        setLocalApiKey(apiKey);
    }, [apiKey, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onApiKeySave(localApiKey);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-11/12 max-w-md flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-border-color">
                    <h2 className="text-lg font-bold">Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </header>
                <div className="p-6 space-y-4">
                     <div>
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
                        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                        >
                        Save API Key
                    </button>
                </div>
            </div>
        </div>
    );
};