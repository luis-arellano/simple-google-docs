'use client';

import { useEffect } from 'react';
import { useDocumentStore } from '../store/documentStore';

export const useDocument = (documentId?: string) => {
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

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (documentId && documentId !== currentDocument?.id) {
      loadDocument(documentId);
    }
  }, [documentId, currentDocument?.id, loadDocument]);

  const handleContentChange = (content: string) => {
    if (currentDocument) {
      updateDocument(currentDocument.id, content);
    }
  };

  const handleTitleChange = (title: string) => {
    if (currentDocument) {
      updateDocumentTitle(currentDocument.id, title);
    }
  };

  return {
    currentDocument,
    documents,
    isLoading,
    error,
    handleContentChange,
    handleTitleChange,
    createDocument,
    setError,
  };
};