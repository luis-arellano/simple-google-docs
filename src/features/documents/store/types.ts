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
  updateDocument: (id: string, content: string) => void;
  updateDocumentTitle: (id: string, title: string) => void;
  loadDocument: (id: string) => void;
  loadDocuments: () => void;
  setError: (error: string | null) => void;
}