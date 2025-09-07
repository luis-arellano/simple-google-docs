'use client';

import { useState, useCallback } from 'react';
import { useDocument } from '../hooks/useDocument';

interface DocumentEditorProps {
  documentId: string;
}

export const DocumentEditor = ({ documentId }: DocumentEditorProps) => {
  const { currentDocument, handleContentChange, handleTitleChange, isLoading, error } = useDocument(documentId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleTitleClick = useCallback(() => {
    if (currentDocument) {
      setTempTitle(currentDocument.title);
      setIsEditingTitle(true);
    }
  }, [currentDocument]);

  const handleTitleSubmit = useCallback(() => {
    if (tempTitle.trim() && currentDocument) {
      handleTitleChange(tempTitle.trim());
    }
    setIsEditingTitle(false);
  }, [tempTitle, currentDocument, handleTitleChange]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  }, [handleTitleSubmit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <p className="text-lg font-medium">Document not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border min-h-screen">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleTitleKeyDown}
                  className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                  autoFocus
                />
              ) : (
                <h1 
                  className="text-2xl font-bold cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  onClick={handleTitleClick}
                >
                  {currentDocument.title || 'Untitled Document'}
                </h1>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Last modified: {currentDocument.lastModified.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="p-4">
          <textarea
            value={currentDocument.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your document..."
            className="w-full min-h-[600px] p-4 text-base leading-relaxed resize-none border-none outline-none font-mono"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          />
        </div>
      </div>
    </div>
  );
};