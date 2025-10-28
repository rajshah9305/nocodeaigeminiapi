
import React, { useMemo } from 'react';

interface PreviewPanelProps {
  html: string;
  css: string;
  javascript: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ html, css, javascript }) => {

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

  return (
    <div className="flex-1 flex flex-col bg-white">
       <div className="p-2 border-b border-border-color bg-secondary-bg">
            <h2 className="text-sm font-semibold text-gray-700">Live Preview</h2>
       </div>
      <iframe
        srcDoc={srcDoc}
        title="Live Preview"
        sandbox="allow-scripts allow-forms"
        className="w-full h-full border-0"
      />
    </div>
  );
};
