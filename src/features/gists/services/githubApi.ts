import { Gist, GistDetail } from '../store/types';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

/**
 * Fetch all public gists for a given username
 */
export async function fetchUserGists(username: string): Promise<Gist[]> {
  if (!username.trim()) {
    throw new GitHubApiError('Username is required');
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}/gists`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new GitHubApiError(`User '${username}' not found`, response.status, response.statusText);
      }
      if (response.status === 403) {
        throw new GitHubApiError('API rate limit exceeded. Please try again later.', response.status, response.statusText);
      }
      throw new GitHubApiError(`Failed to fetch gists: ${response.statusText}`, response.status, response.statusText);
    }

    const gists: Gist[] = await response.json();
    return gists;
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }
    throw new GitHubApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch detailed information for a specific gist including file contents
 */
export async function fetchGistDetail(gistId: string): Promise<GistDetail> {
  if (!gistId.trim()) {
    throw new GitHubApiError('Gist ID is required');
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/gists/${gistId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new GitHubApiError(`Gist '${gistId}' not found`, response.status, response.statusText);
      }
      if (response.status === 403) {
        throw new GitHubApiError('API rate limit exceeded. Please try again later.', response.status, response.statusText);
      }
      throw new GitHubApiError(`Failed to fetch gist: ${response.statusText}`, response.status, response.statusText);
    }

    const gist: GistDetail = await response.json();
    return gist;
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }
    throw new GitHubApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
