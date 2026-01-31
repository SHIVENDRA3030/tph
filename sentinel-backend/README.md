# Sentinel Backend

Real-time Disaster Management System Backend API

## Features

- **Real-time Alert System**: WebSocket-based instant notifications for disasters
- **Optimal Route Algorithm**: Multi-criteria pathfinding (distance, traffic, safety, time)
- **Geospatial Support**: PostGIS-enabled PostgreSQL for location-based queries
- **External API Integration**: OpenWeatherMap, NewsAPI, USGS Earthquake data
- **Hope Avatar API**: Contextual motivational content delivery
- **User Reporting**: Incident submission and tracking system

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS
- **ORM**: Sequelize
- **Real-time**: Socket.io
- **External APIs**: OpenWeatherMap, NewsAPI, Mapbox

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd sentinel-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Initialize database and enable PostGIS
npm run db:init

# Seed with sample data
npm run db:seed
```

### 4. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Emergency Routing

#### POST /api/emergency/route
Calculate optimal emergency route

**Request Body:**
```json
{
  "userLocation": { "lat": 40.7128, "lng": -74.0060 },
  "emergencyType": "flood",
  "destinationType": "shelter",
  "preferences": {
    "prioritizeSafety": true,
    "avoidTraffic": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "route": { /* GeoJSON LineString */ },
    "instructions": [ /* Turn-by-turn directions */ ],
    "metadata": {
      "totalDistanceKm": 4.2,
      "estimatedTimeMin": 12,
      "safetyScore": 85
    }
  }
}
```

### News Feed

#### GET /api/feed/news
Get aggregated disaster news

**Query Parameters:**
- `type` - Filter by disaster type
- `severity` - Filter by severity
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

### Motivation (Hope Avatar)

#### GET /api/motivation/contextual
Get contextual motivation content

**Query Parameters:**
- `disasterType` - Type of disaster for context
- `contentType` - quote, story, fact, affirmation

### User Reports

#### POST /api/report/incident
Submit incident report

**Request Body:**
```json
{
  "type": "hazard",
  "title": "Downed Power Line",
  "description": "Power line down on Oak Street",
  "location": { "lat": 40.7500, "lng": -74.0000 },
  "images": []
}
```

## WebSocket Events

### Client -> Server

- `authenticate` - Authenticate user connection
- `location_update` - Update user location
- `subscribe_alerts` - Subscribe to disaster alerts
- `get_motivation` - Request motivation content

### Server -> Client

- `disaster_alert` - Real-time disaster notification
- `motivation` - Motivational content response
- `authenticated` - Authentication confirmation

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sentinel_db
DB_USER=postgres
DB_PASSWORD=password

# Server
PORT=3000
NODE_ENV=development

# External APIs
OPENWEATHERMAP_API_KEY=your_key
NEWSAPI_KEY=your_key
MAPBOX_ACCESS_TOKEN=your_token

# JWT
JWT_SECRET=your_secret

# Alerts
ALERT_POLL_INTERVAL_MINUTES=5
DISASTER_PROXIMITY_KM=50
```

## Database Schema

See `scripts/initDatabase.js` for full SQL schema.

Key tables:
- `users` - User accounts with geolocation
- `emergency_services` - Hospitals, shelters, police, fire stations
- `disaster_events` - Active and historical disasters
- `accident_history` - For routing safety calculations
- `motivation_content` - Hope Avatar content
- `user_reports` - Incident reports

## Architecture

```
sentinel-backend/
├── src/
│   ├── config/         # Database configuration
│   ├── controllers/    # API controllers
│   ├── middleware/     # Auth, rate limiting
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   │   ├── routingService.js      # A* pathfinding
│   │   ├── disasterMonitor.js     # API polling
│   │   └── motivationService.js   # Avatar content
│   └── server.js       # Main server file
├── scripts/
│   ├── initDatabase.js # DB initialization
│   └── seedDatabase.js # Sample data
└── package.json
```

## License

MIT
