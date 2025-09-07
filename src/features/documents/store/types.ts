export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  created: Date;
}

export interface DocumentStore {
  currentDocument: Document | null;
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createDocument: (title: string) => string;
  updateDocument: (id: string, content: string, saveToStorage?: boolean) => void;
  updateDocumentTitle: (id: string, title: string, saveToStorage?: boolean) => void;
  loadDocument: (id: string) => void;
  loadDocuments: () => void;
  setError: (error: string | null) => void;
}