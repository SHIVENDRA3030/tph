const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    field: 'phone_number'
  },
  currentLocation: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    field: 'current_location',
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      alertRadiusKm: 50,
      notificationChannels: ['push', 'sms'],
      preferredLanguage: 'en'
    }
  },
  fcmToken: {
    type: DataTypes.STRING,
    field: 'fcm_token'
  },
  socketId: {
    type: DataTypes.STRING,
    field: 'socket_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Emergency Service Model
const EmergencyService = sequelize.define('EmergencyService', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('hospital', 'police', 'fire', 'shelter'),
    allowNull: false
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  occupancy: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  contactInfo: {
    type: DataTypes.STRING(100),
    field: 'contact_info'
  },
  address: {
    type: DataTypes.TEXT
  },
  operatingHours: {
    type: DataTypes.JSONB,
    field: 'operating_hours'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'emergency_services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Disaster Event Model
const DisasterEvent = sequelize.define('DisasterEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('flood', 'earthquake', 'fire', 'storm', 'tsunami', 'landslide', 'accident', 'other'),
    allowNull: false
  },
  severityLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    field: 'severity_level'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: false
  },
  impactRadiusKm: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'impact_radius_km'
  },
  affectedZones: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    field: 'affected_zones'
  },
  instructions: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  source: {
    type: DataTypes.STRING(100)
  },
  externalId: {
    type: DataTypes.STRING,
    field: 'external_id'
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'started_at'
  },
  endedAt: {
    type: DataTypes.DATE,
    field: 'ended_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'active'
  }
}, {
  tableName: 'disaster_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Accident History Model (for routing safety scores)
const AccidentHistory = sequelize.define('AccidentHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: false
  },
  severity: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10
    }
  },
  occurredAt: {
    type: DataTypes.DATE,
    field: 'occurred_at'
  },
  description: {
    type: DataTypes.TEXT
  },
  weatherConditions: {
    type: DataTypes.STRING(50),
    field: 'weather_conditions'
  },
  roadType: {
    type: DataTypes.STRING(50),
    field: 'road_type'
  }
}, {
  tableName: 'accident_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Motivation Content Model (for Hope Avatar)
const MotivationContent = sequelize.define('MotivationContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.ENUM('general', 'earthquake', 'flood', 'fire', 'storm', 'survival', 'heroic', 'encouragement'),
    defaultValue: 'general'
  },
  type: {
    type: DataTypes.ENUM('quote', 'story', 'fact', 'affirmation'),
    defaultValue: 'quote'
  },
  contentText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content_text'
  },
  title: {
    type: DataTypes.STRING(200)
  },
  author: {
    type: DataTypes.STRING(100)
  },
  source: {
    type: DataTypes.STRING(200)
  },
  heroicStoryReference: {
    type: DataTypes.STRING(255),
    field: 'heroic_story_reference'
  },
  audioUrl: {
    type: DataTypes.STRING(500),
    field: 'audio_url'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'motivation_content',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// User Report Model (for complaints/incidents)
const UserReport = sequelize.define('UserReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: User,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('emergency', 'hazard', 'infrastructure', 'other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  contactName: {
    type: DataTypes.STRING(100),
    field: 'contact_name'
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    field: 'contact_phone'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  assignedTo: {
    type: DataTypes.STRING(100),
    field: 'assigned_to'
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    field: 'resolution_notes'
  }
}, {
  tableName: 'user_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// News Article Model (cached from external APIs)
const NewsArticle = sequelize.define('NewsArticle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT
  },
  content: {
    type: DataTypes.TEXT
  },
  source: {
    type: DataTypes.STRING(100)
  },
  sourceUrl: {
    type: DataTypes.STRING(500),
    field: 'source_url'
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    field: 'image_url'
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  },
  disasterType: {
    type: DataTypes.ENUM('flood', 'earthquake', 'fire', 'storm', 'tsunami', 'landslide', 'accident', 'other', 'general'),
    field: 'disaster_type'
  },
  severity: {
    type: DataTypes.ENUM('critical', 'warning', 'info', 'safe')
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326)
  },
  externalId: {
    type: DataTypes.STRING,
    field: 'external_id',
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'news_articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Historical Event Model (for discovery page)
const HistoricalEvent = sequelize.define('HistoricalEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'event_date'
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326)
  },
  locationName: {
    type: DataTypes.STRING(200),
    field: 'location_name'
  },
  disasterType: {
    type: DataTypes.ENUM('flood', 'earthquake', 'fire', 'storm', 'tsunami', 'landslide', 'accident', 'other'),
    field: 'disaster_type'
  },
  description: {
    type: DataTypes.TEXT
  },
  impact: {
    type: DataTypes.TEXT
  },
  casualties: {
    type: DataTypes.INTEGER
  },
  damageEstimate: {
    type: DataTypes.STRING(100),
    field: 'damage_estimate'
  },
  lessons: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  heroStory: {
    type: DataTypes.TEXT,
    field: 'hero_story'
  },
  heroName: {
    type: DataTypes.STRING(100),
    field: 'hero_name'
  },
  sources: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  }
}, {
  tableName: 'historical_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
User.hasMany(UserReport, { foreignKey: 'user_id' });
UserReport.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  EmergencyService,
  DisasterEvent,
  AccidentHistory,
  MotivationContent,
  UserReport,
  NewsArticle,
  HistoricalEvent,
  sequelize
};
