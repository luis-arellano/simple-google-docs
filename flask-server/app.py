#!/usr/bin/env python3

from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import time
from datetime import datetime
from typing import Dict, Set, Any

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Enable CORS for all routes and origins with more permissive settings
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize SocketIO with more permissive CORS settings
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    cors_credentials=True,
    logger=True,  # Enable logging for debugging
    engineio_logger=True,  # Enable engine.io logging
    transports=['websocket', 'polling'],
    ping_timeout=60,
    ping_interval=25
)

# In-memory storage for documents and active users
documents: Dict[str, Dict[str, Any]] = {}
active_users: Dict[str, Set[str]] = {}  # document_id -> set of user_ids
user_sessions: Dict[str, str] = {}  # session_id -> user_id

@app.route('/')
def health_check():
    """Health check endpoint"""
    print(f"Health check accessed at {datetime.now()}")
    return {
        'status': 'ok',
        'message': 'Flask WebSocket Server is running',
        'timestamp': datetime.now().isoformat(),
        'active_documents': len(documents),
        'total_users': sum(len(users) for users in active_users.values())
    }

@app.route('/test')
def test_route():
    """Simple test route"""
    print(f"Test route accessed at {datetime.now()}")
    return "<h1>Flask Server is Working!</h1><p>If you see this, the server is accessible.</p>"

@app.before_request
def before_request():
    """Log all incoming requests"""
    print(f"Incoming request: {request.method} {request.url} from {request.remote_addr}")
    print(f"Headers: {dict(request.headers)}")

@app.after_request
def after_request(response):
    """Add CORS headers to all responses"""
    print(f"Outgoing response: {response.status_code}")
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/documents/<document_id>')
def get_document(document_id):
    """Get document content via HTTP (backup)"""
    if document_id in documents:
        return {
            'id': document_id,
            'content': documents[document_id]['content'],
            'title': documents[document_id]['title'],
            'last_modified': documents[document_id]['last_modified']
        }
    return {'error': 'Document not found'}, 404

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    session_id = request.sid
    print(f"Client connected: {session_id}")
    emit('connected', {'session_id': session_id})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    session_id = request.sid
    user_id = user_sessions.get(session_id)
    
    if user_id:
        # Find which documents this user was in and remove them
        for document_id, users in active_users.items():
            if user_id in users:
                users.discard(user_id)
                leave_room(document_id)
                
                # Notify other users in the document
                emit('user_left', {
                    'user_id': user_id,
                    'document_id': document_id,
                    'timestamp': time.time()
                }, room=document_id)
                
        # Clean up user session
        del user_sessions[session_id]
        
    print(f"Client disconnected: {session_id}")

@socketio.on('join_document')
def handle_join_document(data):
    """Handle user joining a document room"""
    session_id = request.sid
    document_id = data.get('document_id')
    user_id = data.get('user_id', f'user_{session_id[:8]}')
    
    if not document_id:
        emit('error', {'message': 'document_id is required'})
        return
    
    # Initialize document if it doesn't exist
    if document_id not in documents:
        documents[document_id] = {
            'content': '',
            'title': 'Untitled Document',
            'created': time.time(),
            'last_modified': time.time()
        }
    
    # Initialize active users set for document
    if document_id not in active_users:
        active_users[document_id] = set()
    
    # Add user to document and session tracking
    active_users[document_id].add(user_id)
    user_sessions[session_id] = user_id
    
    # Join the document room
    join_room(document_id)
    
    # Send current document state to the joining user
    emit('document_state', {
        'document_id': document_id,
        'content': documents[document_id]['content'],
        'title': documents[document_id]['title'],
        'last_modified': documents[document_id]['last_modified'],
        'active_users': list(active_users[document_id])
    })
    
    # Notify other users in the document
    emit('user_joined', {
        'user_id': user_id,
        'document_id': document_id,
        'timestamp': time.time()
    }, room=document_id, include_self=False)
    
    print(f"User {user_id} joined document {document_id}")

@socketio.on('leave_document')
def handle_leave_document(data):
    """Handle user leaving a document room"""
    session_id = request.sid
    document_id = data.get('document_id')
    user_id = user_sessions.get(session_id)
    
    if document_id and user_id:
        # Remove user from document
        if document_id in active_users:
            active_users[document_id].discard(user_id)
            
        leave_room(document_id)
        
        # Notify other users in the document
        emit('user_left', {
            'user_id': user_id,
            'document_id': document_id,
            'timestamp': time.time()
        }, room=document_id)
        
        print(f"User {user_id} left document {document_id}")

@socketio.on('text_change')
def handle_text_change(data):
    """Handle real-time text changes with last-write-wins conflict resolution"""
    session_id = request.sid
    document_id = data.get('document_id')
    content = data.get('content', '')
    user_id = user_sessions.get(session_id)
    timestamp = time.time()
    
    if not document_id or not user_id:
        emit('error', {'message': 'document_id and user authentication required'})
        return
    
    # Update document content (last-write-wins)
    if document_id in documents:
        documents[document_id]['content'] = content
        documents[document_id]['last_modified'] = timestamp
        
        # Broadcast change to all other users in the document
        emit('content_updated', {
            'document_id': document_id,
            'content': content,
            'user_id': user_id,
            'timestamp': timestamp
        }, room=document_id, include_self=False)
        
        print(f"Text change in {document_id} by {user_id}: {len(content)} characters")

@socketio.on('title_change')
def handle_title_change(data):
    """Handle document title changes"""
    session_id = request.sid
    document_id = data.get('document_id')
    title = data.get('title', '')
    user_id = user_sessions.get(session_id)
    timestamp = time.time()
    
    if not document_id or not user_id:
        emit('error', {'message': 'document_id and user authentication required'})
        return
    
    # Update document title
    if document_id in documents:
        documents[document_id]['title'] = title
        documents[document_id]['last_modified'] = timestamp
        
        # Broadcast change to all other users in the document
        emit('title_updated', {
            'document_id': document_id,
            'title': title,
            'user_id': user_id,
            'timestamp': timestamp
        }, room=document_id, include_self=False)
        
        print(f"Title change in {document_id} by {user_id}: '{title}'")

@socketio.on('cursor_position')
def handle_cursor_position(data):
    """Handle cursor position updates for collaborative editing"""
    session_id = request.sid
    document_id = data.get('document_id')
    position = data.get('position', 0)
    selection_start = data.get('selection_start', 0)
    selection_end = data.get('selection_end', 0)
    user_id = user_sessions.get(session_id)
    
    if document_id and user_id:
        # Broadcast cursor position to other users in the document
        emit('cursor_updated', {
            'document_id': document_id,
            'user_id': user_id,
            'position': position,
            'selection_start': selection_start,
            'selection_end': selection_end,
            'timestamp': time.time()
        }, room=document_id, include_self=False)

if __name__ == '__main__':
    print("Starting Flask WebSocket Server...")
    print("Server will run on http://127.0.0.1:5001")
    print("WebSocket endpoint: ws://127.0.0.1:5001")
    print("Health check: curl http://127.0.0.1:5001/")
    print("Test page: http://127.0.0.1:5001/test")
    
    # Run with SocketIO
    socketio.run(
        app, 
        host='0.0.0.0',  # Listen on all interfaces
        port=5001,  # Changed from 5000 to avoid macOS Control Center conflict
        debug=True,
        allow_unsafe_werkzeug=True  # For development only
    )