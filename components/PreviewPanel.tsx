import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PreviewPanelProps {
  html: string;
  css: string;
  javascript: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ html, css, javascript }) => {
  const [iframeKey, setIframeKey] = useState(0);

  const srcDoc = useMemo(() => {
    return `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${javascript}</script>
        </body>
      </html>
    `;
  }, [html, css, javascript]);

  const handleRefresh = () => {
    setIframeKey(prevKey => prevKey + 1);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
       <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-700 px-2">Live Preview</h2>
            <button
                onClick={handleRefresh}
                className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-500"
                title="Refresh Preview"
            >
                <RefreshCw className="h-4 w-4" />
            </button>
       </div>
      <iframe
        key={iframeKey}
        srcDoc={srcDoc}
        title="Live Preview"
        sandbox="allow-scripts allow-forms"
        className="w-full h-full border-0"
      />
    </div>
  );
};