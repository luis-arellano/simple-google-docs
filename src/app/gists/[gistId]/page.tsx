'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';
import { useGistDetail } from '@/features/gists';
import { GistFile } from '@/features/gists';

export default function GistDetailPage() {
  const params = useParams();
  const gistId = params.gistId as string;
  const { gist, isLoading, error } = useGistDetail(gistId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <LoadingSpinner size="large" />
            <p className="text-gray-600 mt-4">Loading gist...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Link
              href="/gists"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Search
            </Link>
          </div>
          <ErrorMessage message={error} />
        </div>
      </main>
    );
  }

  if (!gist) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Link
              href="/gists"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Search
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Gist not found</p>
          </div>
        </div>
      </main>
    );
  }

  const fileCount = Object.keys(gist.files).length;
  const createdDate = new Date(gist.created_at).toLocaleDateString();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/gists"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Search
          </Link>
        </div>

        {/* Gist Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <img
              src={gist.owner.avatar_url}
              alt={gist.owner.login}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                📄 {gist.description || 'Untitled Gist'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>👤 by {gist.owner.login}</span>
                <span>📅 {createdDate}</span>
                <span>📁 {fileCount} file{fileCount !== 1 ? 's' : ''}</span>
                {gist.comments > 0 && (
                  <span>💬 {gist.comments} comment{gist.comments !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📁 Files ({fileCount}):
          </h2>
          <div className="space-y-6">
            {Object.values(gist.files).map((file) => (
              <GistFile key={file.filename} file={file} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
