// models/Gallery.js
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Gallery image'
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot be more than 200 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'projects',
      'events',
      'travel',
      'portraits',
      'nature',
      'art',
      'food',
      'architecture',
      'other'
    ],
    default: 'other'
  },
  location: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: true
  },

language: {
  type: String,
  enum: ['en', 'ne'], 
  default: 'en'
},
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for primary image
GallerySchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Method to increment views
GallerySchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to increment likes
GallerySchema.methods.incrementLikes = async function() {
  this.likes += 1;
  await this.save();
};

module.exports = mongoose.model('Gallery', GallerySchema);