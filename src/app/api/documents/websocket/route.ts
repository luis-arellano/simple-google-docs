import { NextRequest } from 'next/server';

interface DocumentOperation {
  type: 'content_change' | 'cursor_position' | 'user_join' | 'user_leave';
  documentId: string;
  userId: string;
  timestamp: number;
  data: any;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  documentId: string;
}

// Store active connections per document
const documentConnections = new Map<string, Set<ConnectedClient>>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  const userId = searchParams.get('userId') || crypto.randomUUID();

  if (!documentId) {
    return new Response('Missing documentId', { status: 400 });
  }

  // Check if the request is a WebSocket upgrade
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  try {
    // Create WebSocket connection
    const { socket: ws, response } = new WebSocketPair();
    
    const client: ConnectedClient = {
      ws: ws as WebSocket,
      userId,
      documentId,
    };

    // Add client to document connections
    if (!documentConnections.has(documentId)) {
      documentConnections.set(documentId, new Set());
    }
    documentConnections.get(documentId)!.add(client);

    // Handle WebSocket messages
    ws.addEventListener('message', (event) => {
      try {
        const operation: DocumentOperation = JSON.parse(event.data);
        operation.timestamp = Date.now();
        operation.userId = userId;
        operation.documentId = documentId;

        // Broadcast to all other clients in the same document
        const clients = documentConnections.get(documentId);
        if (clients) {
          clients.forEach((otherClient) => {
            if (otherClient.userId !== userId && otherClient.ws.readyState === WebSocket.OPEN) {
              otherClient.ws.send(JSON.stringify(operation));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Handle WebSocket close
    ws.addEventListener('close', () => {
      const clients = documentConnections.get(documentId);
      if (clients) {
        clients.delete(client);
        if (clients.size === 0) {
          documentConnections.delete(documentId);
        } else {
          // Notify other clients that user left
          const leaveOperation: DocumentOperation = {
            type: 'user_leave',
            documentId,
            userId,
            timestamp: Date.now(),
            data: { userId },
          };
          
          clients.forEach((otherClient) => {
            if (otherClient.ws.readyState === WebSocket.OPEN) {
              otherClient.ws.send(JSON.stringify(leaveOperation));
            }
          });
        }
      }
    });

    // Notify existing clients that a new user joined
    const clients = documentConnections.get(documentId);
    if (clients && clients.size > 1) {
      const joinOperation: DocumentOperation = {
        type: 'user_join',
        documentId,
        userId,
        timestamp: Date.now(),
        data: { userId },
      };

      clients.forEach((otherClient) => {
        if (otherClient.userId !== userId && otherClient.ws.readyState === WebSocket.OPEN) {
          otherClient.ws.send(JSON.stringify(joinOperation));
        }
      });
    }

    return response;
  } catch (error) {
    console.error('WebSocket connection error:', error);
    return new Response('WebSocket connection failed', { status: 500 });
  }
}

// Helper class for WebSocket pair
class WebSocketPair {
  constructor() {
    const server = new WebSocket('ws://localhost:0');
    const client = new WebSocket('ws://localhost:0');
    
    // This is a simplified implementation
    // In a real environment, you'd use a proper WebSocket server
    return {
      socket: server,
      response: new Response(null, {
        status: 101,
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
        },
      }),
    };
  }
}