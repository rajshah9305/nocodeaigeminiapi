
import React from 'react';
import { X } from 'lucide-react';

interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    type: 'image' | 'text';
}

export const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, title, content, type }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-border-color">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {type === 'image' ? (
                        <img src={content} alt={title} className="max-w-full max-h-[70vh] mx-auto" />
                    ) : (
                        <p className="text-base whitespace-pre-wrap">{content}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
