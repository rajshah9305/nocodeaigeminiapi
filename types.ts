export interface CodeBundle {
  html: string;
  css: string;
  javascript: string;
}

export type MessageRole = 'user' | 'model';

export interface BaseMessage {
  id: string;
  role: MessageRole;
}

export interface UserMessage extends BaseMessage {
  role: 'user';
  text: string;
}

export interface ModelResponseMessage extends BaseMessage {
  role: 'model';
  code: CodeBundle;
  sources?: any[];
  originalPrompt: string;
}

// A simple text message from the model (e.g., for errors or greetings)
export interface ModelTextMessage extends BaseMessage {
    role: 'model';
    text: string;
    isThinking?: boolean;
}

export type ChatMessage = UserMessage | ModelResponseMessage | ModelTextMessage;