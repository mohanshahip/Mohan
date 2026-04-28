const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a skill name'],
    trim: true,
    maxlength: [100, 'Skill name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'frontend',
      'backend',
      'database',
      'devops',
      'mobile',
      'design',
      'testing',
      'tools',
      'soft-skills',
      'other'
    ],
    default: 'other'
  },
  proficiency: {
    type: Number,
    required: [true, 'Please add proficiency level'],
    min: [1, 'Proficiency must be at least 1'],
    max: [100, 'Proficiency cannot exceed 100'],
    default: 50
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years cannot be negative'],
    default: 1
  },
  icon: {
    type: String,
    default: '💻'
  },
  iconType: {
    type: String,
    enum: ['emoji', 'fontawesome', 'custom'],
    default: 'emoji'
  },
  iconClass: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#667eea'
  },
  projectsUsedIn: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String
  }],
  language: {
    type: String,
    enum: ['en', 'ne'],
    default: 'en'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  metrics: {
    projectsCount: {
      type: Number,
      default: 0
    },
    satisfaction: {
      type: Number,
      min: 0,
      max: 100,
      default: 85
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'occasionally'],
      default: 'weekly'
    }
  },
  links: {
    documentation: String,
    tutorial: String,
    officialWebsite: String
  }
}, {
  timestamps: true
});

// Generate slug before saving
SkillSchema.pre('save', function () {
  if (!this.isModified('name')) return;

  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
});


// Virtual for proficiency label
SkillSchema.virtual('proficiencyLabel').get(function() {
  if (this.proficiency >= 90) return 'Expert';
  if (this.proficiency >= 70) return 'Advanced';
  if (this.proficiency >= 50) return 'Intermediate';
  return 'Beginner';
});

// Virtual for experience label
SkillSchema.virtual('experienceLabel').get(function() {
  if (this.yearsOfExperience >= 5) return `${this.yearsOfExperience}+ years`;
  if (this.yearsOfExperience === 1) return '1 year';
  return `${this.yearsOfExperience} years`;
});

module.exports = mongoose.model('Skill', SkillSchema);