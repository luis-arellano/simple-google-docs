'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { websocketService, DocumentUpdate, TitleUpdate, UserPresence, DocumentState } from '../services';

export const useCollaborativeDocument = (documentId?: string) => {
  const {
    currentDocument,
    documents,
    isLoading,
    error,
    loadDocument,
    loadDocuments,
    updateDocument,
    updateDocumentTitle,
    createDocument,
    setError,
  } = useDocumentStore();

  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Use refs to prevent stale closures in WebSocket callbacks
  const currentDocumentRef = useRef(currentDocument);
  const documentIdRef = useRef(documentId);
  
  // Update refs when values change
  useEffect(() => {
    currentDocumentRef.current = currentDocument;
  }, [currentDocument]);
  
  useEffect(() => {
    documentIdRef.current = documentId;
  }, [documentId]);

  // Setup WebSocket connection and event listeners
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        // Setup event listeners
        websocketService.onConnected(() => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setConnectionError(null);
        });

        websocketService.onDisconnected(() => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        });

        websocketService.onContentUpdate((update: DocumentUpdate) => {
          console.log('Received content update:', update);
          // Only update if this is for the current document and not from ourselves
          if (update.document_id === documentIdRef.current && update.user_id !== websocketService.user) {
            updateDocument(update.document_id, update.content, false); // false = don't trigger WebSocket
          }
        });

        websocketService.onTitleUpdate((update: TitleUpdate) => {
          console.log('Received title update:', update);
          // Only update if this is for the current document and not from ourselves
          if (update.document_id === documentIdRef.current && update.user_id !== websocketService.user) {
            updateDocumentTitle(update.document_id, update.title, false); // false = don't trigger WebSocket
          }
        });

        websocketService.onDocumentState((state: DocumentState) => {
          console.log('Received document state:', state);
          // Update local document with server state
          if (state.document_id === documentIdRef.current) {
            updateDocument(state.document_id, state.content, false);
            updateDocumentTitle(state.document_id, state.title, false);
            setActiveUsers(state.active_users);
          }
        });

        websocketService.onUserJoined((user: UserPresence) => {
          console.log('User joined:', user);
          if (user.document_id === documentIdRef.current) {
            setActiveUsers(prev => [...prev.filter(u => u !== user.user_id), user.user_id]);
          }
        });

        websocketService.onUserLeft((user: UserPresence) => {
          console.log('User left:', user);
          if (user.document_id === documentIdRef.current) {
            setActiveUsers(prev => prev.filter(u => u !== user.user_id));
          }
        });

        // Connect to WebSocket server
        await websocketService.connect();

      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
        setConnectionError('Failed to connect to collaboration server');
      }
    };

    setupWebSocket();

    // Cleanup on unmount
    return () => {
      if (documentId) {
        websocketService.leaveDocument();
      }
      websocketService.disconnect();
    };
  }, []); // Empty dependency array - setup only once

  // Join document when documentId changes
  useEffect(() => {
    if (documentId && isConnected) {
      console.log('Joining document:', documentId);
      websocketService.joinDocument(documentId);
    }
    
    return () => {
      if (documentId && isConnected) {
        websocketService.leaveDocument();
      }
    };
  }, [documentId, isConnected]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Load specific document
  useEffect(() => {
    if (documentId && documentId !== currentDocument?.id) {
      loadDocument(documentId);
    }
  }, [documentId, currentDocument?.id, loadDocument]);

  const handleContentChange = useCallback((content: string) => {
    if (currentDocument) {
      // Update local state immediately
      updateDocument(currentDocument.id, content, false);
      
      // Send to WebSocket server
      if (isConnected) {
        websocketService.sendTextChange(content);
      }
    }
  }, [currentDocument, updateDocument, isConnected]);

  const handleTitleChange = useCallback((title: string) => {
    if (currentDocument) {
      // Update local state immediately
      updateDocumentTitle(currentDocument.id, title, false);
      
      // Send to WebSocket server
      if (isConnected) {
        websocketService.sendTitleChange(title);
      }
    }
  }, [currentDocument, updateDocumentTitle, isConnected]);

  const handleCursorChange = useCallback((position: number, selectionStart: number, selectionEnd: number) => {
    if (currentDocument && isConnected) {
      websocketService.sendCursorPosition(position, selectionStart, selectionEnd);
    }
  }, [currentDocument, isConnected]);

  return {
    currentDocument,
    documents,
    isLoading,
    error: error || connectionError,
    handleContentChange,
    handleTitleChange,
    handleCursorChange,
    createDocument,
    setError,
    // Collaboration-specific data
    isConnected,
    activeUsers,
    connectionError,
    currentUser: websocketService.user,
  };
};