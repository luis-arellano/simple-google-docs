'use client';

import { create } from 'zustand';
import { Document, DocumentStore } from './types';

const STORAGE_KEY = 'collaborative-documents';

const loadDocumentsFromStorage = (): Document[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((doc: any) => ({
      ...doc,
      created: new Date(doc.created),
      lastModified: new Date(doc.lastModified),
    }));
  } catch {
    return [];
  }
};

const saveDocumentsToStorage = (documents: Document[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  } catch (error) {
    console.error('Failed to save documents:', error);
  }
};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  currentDocument: null,
  documents: [],
  isLoading: false,
  error: null,

  createDocument: (title: string) => {
    const newDocument: Document = {
      id: crypto.randomUUID(),
      title,
      content: '',
      created: new Date(),
      lastModified: new Date(),
    };

    set((state) => {
      const updatedDocuments = [...state.documents, newDocument];
      saveDocumentsToStorage(updatedDocuments);
      return {
        documents: updatedDocuments,
        currentDocument: newDocument,
      };
    });

    return newDocument.id;
  },

  updateDocument: (id: string, content: string) => {
    set((state) => {
      const updatedDocuments = state.documents.map((doc) =>
        doc.id === id
          ? { ...doc, content, lastModified: new Date() }
          : doc
      );
      
      const updatedCurrent = state.currentDocument?.id === id
        ? { ...state.currentDocument, content, lastModified: new Date() }
        : state.currentDocument;

      saveDocumentsToStorage(updatedDocuments);
      
      return {
        documents: updatedDocuments,
        currentDocument: updatedCurrent,
      };
    });
  },

  updateDocumentTitle: (id: string, title: string) => {
    set((state) => {
      const updatedDocuments = state.documents.map((doc) =>
        doc.id === id
          ? { ...doc, title, lastModified: new Date() }
          : doc
      );
      
      const updatedCurrent = state.currentDocument?.id === id
        ? { ...state.currentDocument, title, lastModified: new Date() }
        : state.currentDocument;

      saveDocumentsToStorage(updatedDocuments);
      
      return {
        documents: updatedDocuments,
        currentDocument: updatedCurrent,
      };
    });
  },

  loadDocument: (id: string) => {
    const { documents } = get();
    const document = documents.find((doc) => doc.id === id);
    
    if (document) {
      set({ currentDocument: document });
    } else {
      set({ error: 'Document not found' });
    }
  },

  loadDocuments: () => {
    set({ isLoading: true });
    try {
      const documents = loadDocumentsFromStorage();
      set({ documents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load documents', isLoading: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));