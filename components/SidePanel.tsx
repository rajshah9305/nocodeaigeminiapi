import React from 'react';
import { EditorPanel } from './EditorPanel';
import type { CodeBundle } from '../types';

interface SidePanelProps {
  code: CodeBundle;
  onCodeChange: (newCode: CodeBundle) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ code, onCodeChange }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <EditorPanel code={code} onCodeChange={onCodeChange} />
    </div>
  );
};