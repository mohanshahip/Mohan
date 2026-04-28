// models/Poem.js
const mongoose = require('mongoose');

const PoemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a poem title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add poem content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  author: {
    type: String,
    default: 'Mohan Kattel',
    trim: true
  },
  language: {
    type: String,
    enum: ['en', 'ne'],
    default: 'en'
  },
  category: {
    type: String,
    enum: [
      'love',
      'nature',
      'inspirational',
      'philosophical',
      'nostalgic',
      'spiritual',
      'social',
      'humorous',
      'other'
    ],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Poem image'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  featuredImage: {
    url: String,
    alt: String
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 2
  }
}, {
  timestamps: true
});

// Method to increment views
PoemSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to increment likes
PoemSchema.methods.incrementLikes = async function() {
  this.likes += 1;
  await this.save();
};

// Virtual for formatted reading time
PoemSchema.virtual('formattedReadingTime').get(function() {
  return `${this.readingTime} min read`;
});

// Ensure virtuals are included when converting to JSON or Object
PoemSchema.set('toJSON', { virtuals: true });
PoemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Poem', PoemSchema);