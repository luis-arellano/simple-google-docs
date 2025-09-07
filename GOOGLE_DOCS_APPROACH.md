# Google Docs Implementation Approach (Revised)

## Overview
Build a collaborative document editor with real-time editing capabilities for multiple users, similar to Google Docs, using Next.js frontend + Flask WebSocket backend.

## Tech Stack & Architecture

### Core Technologies
- **Frontend**: Next.js 15 + React 19 (existing)
- **Backend**: Flask + Flask-SocketIO (Python WebSocket server)
- **Real-time Communication**: WebSocket via Flask-SocketIO
- **Text Editor**: Simple textarea → ContentEditable → Rich text editor
- **State Management**: Zustand (already in use)
- **Styling**: Tailwind CSS (already configured)

### Why This Stack?
- **Flask-SocketIO**: Mature, production-ready WebSocket implementation
- **Python Familiarity**: Leverage your Python expertise
- **Next.js Limitation**: Next.js lacks native WebSocket support in production
- **Separation of Concerns**: Frontend (Next.js) + Real-time Backend (Flask)
- **45-minute constraint**: Focus on core functionality over polish

## Implementation Strategy (Revised)

### Phase 1: Basic Editor (15 minutes) ✅ COMPLETED
1. ✅ Create document page with simple textarea
2. ✅ Basic document persistence (localStorage initially)
3. ✅ Simple UI with document title

### Phase 2: Flask WebSocket Server (15 minutes)
1. Create Flask server with Flask-SocketIO
2. Document room management (join/leave)
3. Real-time text synchronization
4. Basic conflict resolution (last-write-wins)

### Phase 3: Frontend WebSocket Integration (10 minutes)
1. WebSocket client manager in Next.js
2. Connect editor to Flask server
3. Handle real-time updates
4. User presence indicators

### Phase 4: Enhanced Features (5 minutes)
1. Multi-user cursor positions
2. Basic operational transforms (if time permits)

## Technical Approach

### Data Flow
```
Next.js Client → WebSocket → Flask Server → Broadcast → Other Clients
```

### Architecture
```
┌─────────────────┐    WebSocket    ┌──────────────────┐
│   Next.js App   │ ←──────────────→ │   Flask Server   │
│   (Port 3000)   │                 │   (Port 5000)    │
│                 │                 │                  │
│ • DocumentEditor│                 │ • Room Management│
│ • WebSocket     │                 │ • Text Sync      │
│ • Zustand Store │                 │ • User Presence  │
└─────────────────┘                 └──────────────────┘
```

### Flask Server Endpoints
- `http://localhost:5000/` - Health check
- `ws://localhost:5000/` - WebSocket connection
- Events: `join_document`, `leave_document`, `text_change`, `cursor_move`

### Next.js Components (Existing)
- `DocumentEditor`: Main editing interface
- `WebSocketManager`: Handle real-time communication  
- `DocumentStore`: Zustand store for document state

## MVP Features
1. ✅ Multiple users can edit the same document simultaneously
2. ✅ Real-time text synchronization
3. ✅ Basic conflict resolution
4. ✅ User presence awareness
5. ✅ Document persistence

## Quick Setup Commands

### Flask Server Setup
```bash
# Create Flask server directory
mkdir flask-server && cd flask-server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-socketio flask-cors

# Create app.py (see implementation below)
python app.py
```

### Next.js (Already Set Up)
```bash
# In project root
npm run dev  # Runs on http://localhost:3000
```

## Technical Risks & Mitigations
- **Operational Transforms**: Use simple last-write-wins initially
- **WebSocket Connection**: Implement reconnection logic with Flask-SocketIO
- **CORS**: Configure Flask-CORS for Next.js → Flask communication
- **Scalability**: Focus on 2-10 concurrent users max for demo

## Success Criteria
- 2+ users can edit document simultaneously without data loss
- Changes appear in real-time (< 500ms latency)
- Basic conflict resolution prevents corruption
- Demo-ready in 45 minutes