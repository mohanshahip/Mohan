const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  detailedDescription: {
    type: String,
    maxlength: [5000, 'Detailed description cannot be more than 5000 characters']
  },
  techStack: [{
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
      default: 'Project image'
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
      'web-development',
      'mobile-app',
      'design',
      'e-commerce',
      'api',
      'full-stack',
      'open-source',
      'other'
    ],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'planned', 'archived'],
    default: 'completed'
  },
  liveUrl: {
    type: String,
    trim: true
  },
  githubUrl: {
    type: String,
    trim: true
  },
  demoUrl: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  features: [{
    type: String,
    maxlength: [200, 'Feature cannot be more than 200 characters']
  }],
  client: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    enum: ['en', 'ne'],
    default: 'en'
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
  }
}, {
  timestamps: true
});

// Virtual for primary image
ProjectSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Method to increment views
ProjectSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to increment likes
ProjectSchema.methods.incrementLikes = async function() {
  this.likes += 1;
  await this.save();
};

// Method to calculate duration
ProjectSchema.virtual('duration').get(function() {
  if (!this.endDate) return 'Ongoing';
  
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  
  return months < 12 ? `${months} month${months !== 1 ? 's' : ''}` :
         `${Math.floor(months/12)} year${Math.floor(months/12) !== 1 ? 's' : ''}`;
});

module.exports = mongoose.model('Project', ProjectSchema);