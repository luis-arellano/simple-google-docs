# Flask WebSocket Server for Google Docs Clone

Simple Flask server that handles real-time collaborative document editing.

## Quick Start

```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run server
python app.py
```

Server runs on `http://localhost:5001`

## How It Works

- **Real-time sync**: Users connect to document rooms via WebSocket
- **Conflict resolution**: Last-write-wins (simple and fast)
- **Storage**: In-memory (documents reset on restart)

## WebSocket Events

### Client → Server
- `join_document` - Join a document room
- `text_change` - Send text changes
- `title_change` - Send title changes

### Server → Client  
- `content_updated` - Receive text changes from others
- `title_updated` - Receive title changes from others
- `user_joined/user_left` - User presence updates

## API Endpoints

- `GET /` - Health check
- `GET /test` - Test page
- `GET /documents/{id}` - Get document data

That's it! Keep the server running while using the Next.js frontend.