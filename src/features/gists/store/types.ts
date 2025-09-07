// GitHub API response types
export interface GistOwner {
  login: string;
  avatar_url: string;
}

export interface GistFileData {
  filename: string;
  type: string;
  language?: string;
  content?: string;
  size?: number;
}

export interface Gist {
  id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFileData>;
  comments: number;
  owner: GistOwner;
  public: boolean;
}

export interface GistDetail extends Gist {
  files: Record<string, GistFileData & { content: string }>;
}

// Store state types
export interface GistState {
  // Search state
  searchQuery: string;
  searchResults: Gist[];
  isSearching: boolean;
  searchError: string | null;
  
  // Detail state
  currentGist: GistDetail | null;
  isLoadingGist: boolean;
  gistError: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  searchGists: (username: string) => Promise<void>;
  loadGistDetail: (gistId: string) => Promise<void>;
  clearSearch: () => void;
  clearCurrentGist: () => void;
}
