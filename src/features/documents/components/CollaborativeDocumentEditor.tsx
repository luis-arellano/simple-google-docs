'use client';

import { useState, useCallback, useRef } from 'react';
import { useCollaborativeDocument } from '../hooks/useCollaborativeDocument';

interface CollaborativeDocumentEditorProps {
  documentId: string;
}

export const CollaborativeDocumentEditor = ({ documentId }: CollaborativeDocumentEditorProps) => {
  const { 
    currentDocument, 
    handleContentChange, 
    handleTitleChange, 
    handleCursorChange,
    isLoading, 
    error,
    isConnected,
    activeUsers,
    currentUser
  } = useCollaborativeDocument(documentId);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    handleContentChange(content);
    
    // Send cursor position for collaborative editing
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
    handleCursorChange(selectionStart, selectionStart, selectionEnd);
  }, [handleContentChange, handleCursorChange]);

  const handleTextareaSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selectionStart = target.selectionStart;
    const selectionEnd = target.selectionEnd;
    handleCursorChange(selectionStart, selectionStart, selectionEnd);
  }, [handleCursorChange]);

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
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {/* Active Users */}
              {activeUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span>{activeUsers.length} user{activeUsers.length > 1 ? 's' : ''} online</span>
                  <div className="flex gap-1">
                    {activeUsers.slice(0, 3).map((user, index) => (
                      <div 
                        key={user}
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                          user === currentUser ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        title={user === currentUser ? `${user} (You)` : user}
                      >
                        {user.charAt(user.length - 1).toUpperCase()}
                      </div>
                    ))}
                    {activeUsers.length > 3 && (
                      <div className="w-6 h-6 rounded-full text-xs flex items-center justify-center text-white bg-gray-500">
                        +{activeUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                Last modified: {currentDocument.lastModified.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={currentDocument.content}
            onChange={handleTextareaChange}
            onSelect={handleTextareaSelect}
            placeholder="Start writing your document..."
            className="w-full min-h-[600px] p-4 text-base leading-relaxed resize-none border-none outline-none font-mono"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          />
        </div>
      </div>
    </div>
  );
};