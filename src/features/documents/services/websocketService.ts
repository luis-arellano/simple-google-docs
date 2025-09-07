'use client';

import { io, Socket } from 'socket.io-client';

export interface DocumentUpdate {
  document_id: string;
  content: string;
  user_id: string;
  timestamp: number;
}

export interface TitleUpdate {
  document_id: string;
  title: string;
  user_id: string;
  timestamp: number;
}

export interface UserPresence {
  user_id: string;
  document_id: string;
  timestamp: number;
}

export interface DocumentState {
  document_id: string;
  content: string;
  title: string;
  last_modified: number;
  active_users: string[];
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentDocumentId: string | null = null;
  private userId: string;
  
  // Event callbacks
  private onContentUpdateCallback?: (update: DocumentUpdate) => void;
  private onTitleUpdateCallback?: (update: TitleUpdate) => void;
  private onUserJoinedCallback?: (user: UserPresence) => void;
  private onUserLeftCallback?: (user: UserPresence) => void;
  private onDocumentStateCallback?: (state: DocumentState) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;

  constructor() {
    // Generate a unique user ID for this session
    this.userId = this.generateUserId();
  }

  private generateUserId(): string {
    return `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.socket) {
        resolve();
        return;
      }

      try {
        // Connect to Flask server on port 5001
        this.socket = io('http://localhost:5001', {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.isConnected = true;
          this.onConnectedCallback?.();
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
          this.isConnected = false;
          this.onDisconnectedCallback?.();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Listen for document updates
        this.socket.on('content_updated', (data: DocumentUpdate) => {
          console.log('Content updated:', data);
          this.onContentUpdateCallback?.(data);
        });

        this.socket.on('title_updated', (data: TitleUpdate) => {
          console.log('Title updated:', data);
          this.onTitleUpdateCallback?.(data);
        });

        this.socket.on('user_joined', (data: UserPresence) => {
          console.log('User joined:', data);
          this.onUserJoinedCallback?.(data);
        });

        this.socket.on('user_left', (data: UserPresence) => {
          console.log('User left:', data);
          this.onUserLeftCallback?.(data);
        });

        this.socket.on('document_state', (data: DocumentState) => {
          console.log('Document state received:', data);
          this.onDocumentStateCallback?.(data);
        });

        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
        });

        this.socket.on('connected', (data) => {
          console.log('Server confirmed connection:', data);
        });

      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentDocumentId = null;
    }
  }

  public async joinDocument(documentId: string): Promise<void> {
    if (!this.isConnected || !this.socket) {
      await this.connect();
    }

    if (this.currentDocumentId && this.currentDocumentId !== documentId) {
      // Leave current document first
      this.leaveDocument();
    }

    this.currentDocumentId = documentId;
    
    this.socket!.emit('join_document', {
      document_id: documentId,
      user_id: this.userId
    });

    console.log(`Joining document: ${documentId} as user: ${this.userId}`);
  }

  public leaveDocument(): void {
    if (!this.socket || !this.currentDocumentId) return;

    this.socket.emit('leave_document', {
      document_id: this.currentDocumentId
    });

    console.log(`Leaving document: ${this.currentDocumentId}`);
    this.currentDocumentId = null;
  }

  public sendTextChange(content: string): void {
    if (!this.socket || !this.currentDocumentId) return;

    this.socket.emit('text_change', {
      document_id: this.currentDocumentId,
      content,
      user_id: this.userId
    });
  }

  public sendTitleChange(title: string): void {
    if (!this.socket || !this.currentDocumentId) return;

    this.socket.emit('title_change', {
      document_id: this.currentDocumentId,
      title,
      user_id: this.userId
    });
  }

  public sendCursorPosition(position: number, selectionStart: number, selectionEnd: number): void {
    if (!this.socket || !this.currentDocumentId) return;

    this.socket.emit('cursor_position', {
      document_id: this.currentDocumentId,
      position,
      selection_start: selectionStart,
      selection_end: selectionEnd
    });
  }

  // Event subscription methods
  public onContentUpdate(callback: (update: DocumentUpdate) => void): void {
    this.onContentUpdateCallback = callback;
  }

  public onTitleUpdate(callback: (update: TitleUpdate) => void): void {
    this.onTitleUpdateCallback = callback;
  }

  public onUserJoined(callback: (user: UserPresence) => void): void {
    this.onUserJoinedCallback = callback;
  }

  public onUserLeft(callback: (user: UserPresence) => void): void {
    this.onUserLeftCallback = callback;
  }

  public onDocumentState(callback: (state: DocumentState) => void): void {
    this.onDocumentStateCallback = callback;
  }

  public onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  public onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback;
  }

  // Getters
  public get connected(): boolean {
    return this.isConnected;
  }

  public get currentDocument(): string | null {
    return this.currentDocumentId;
  }

  public get user(): string {
    return this.userId;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();