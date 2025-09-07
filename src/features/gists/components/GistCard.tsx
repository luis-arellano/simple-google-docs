import Link from 'next/link';
import { Gist } from '../store/types';

interface GistCardProps {
  gist: Gist;
}

export const GistCard = ({ gist }: GistCardProps) => {
  const fileCount = Object.keys(gist.files).length;
  const firstFileName = Object.keys(gist.files)[0] || 'Untitled';
  const createdDate = new Date(gist.created_at).toLocaleDateString();

  return (
    <Link 
      href={`/gists/${gist.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 hover:border-gray-300"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {firstFileName}
          </h3>
          
          {gist.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {gist.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Created: {createdDate}</span>
            <span>Files: {fileCount}</span>
            {gist.comments > 0 && (
              <span>Comments: {gist.comments}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <img
              src={gist.owner.avatar_url}
              alt={gist.owner.login}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-sm text-gray-600">
              {gist.owner.login}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
