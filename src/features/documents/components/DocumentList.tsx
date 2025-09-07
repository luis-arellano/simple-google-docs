'use client';

import { useDocument } from '../hooks/useDocument';
import Link from 'next/link';

export const DocumentList = () => {
  const { documents, createDocument, isLoading } = useDocument();

  const handleCreateDocument = () => {
    const title = `Untitled Document ${documents.length + 1}`;
    const id = createDocument(title);
    window.location.href = `/documents/${id}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
        <button
          onClick={handleCreateDocument}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Create New Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No documents yet</h2>
          <p className="text-gray-600 mb-6">Create your first document to get started</p>
          <button
            onClick={handleCreateDocument}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create New Document
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {document.title || 'Untitled Document'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {document.content ? 
                      document.content.substring(0, 120) + (document.content.length > 120 ? '...' : '') : 
                      'Empty document'
                    }
                  </p>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span>Modified: {document.lastModified.toLocaleDateString()}</span>
                    <span>Created: {document.created.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};