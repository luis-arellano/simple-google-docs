import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GistFileData } from '../store/types';

interface GistFileProps {
  file: GistFileData & { content: string };
}

// Map common file extensions to language names for syntax highlighting
const getLanguageFromFilename = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'sh': 'bash',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'dockerfile': 'dockerfile'
  };
  
  return extension ? languageMap[extension] || 'text' : 'text';
};

export const GistFile = ({ file }: GistFileProps) => {
  const language = file.language?.toLowerCase() || getLanguageFromFilename(file.filename);
  const lineCount = file.content.split('\n').length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* File header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-600"
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
            <span className="font-medium text-gray-900">{file.filename}</span>
          </div>
          <div className="text-sm text-gray-500">
            {lineCount} lines
          </div>
        </div>
      </div>
      
      {/* File content */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          showLineNumbers={true}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'white',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#6b7280',
            userSelect: 'none'
          }}
        >
          {file.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
