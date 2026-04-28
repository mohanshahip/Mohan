const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  organization: {
    type: String,
    required: [true, 'Please add an organization'],
    maxlength: [100, 'Organization cannot be more than 100 characters']
  },
  yearsActive: {
    type: String,
    required: [true, 'Please add years active'],
    maxlength: [50, 'Years active cannot be more than 50 characters']
  },
  expertise: [{
    type: String,
    trim: true
  }],
  achievements: [{
    title: String,
    description: String,
    year: String
  }],
  metrics: {
    projectsCompleted: { type: Number, default: 0 },
    yearsExperience: { type: Number, default: 0 },
    clientSatisfaction: { type: Number, default: 0 },
    globalReach: { type: String, default: '' }
  },
  heroImage: {
    url: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: 'Professional portrait'
    }
  },
  socialLinks: {
    linkedin: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    contact: {
      type: String,
      default: '/contact'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['en', 'ne'],
    default: 'en'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Ensure only one active hero per language
HeroSchema.index({ language: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('Hero', HeroSchema);