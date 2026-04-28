const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  read: {
    type: Boolean,
    default: false
  },
  replied: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Contact Information Schema
const ContactInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  workingHours: {
    type: String,
    required: true,
    trim: true
  },
  faq: [{
    question: String,
    answer: String
  }],
  availability: {
    availableForProjects: { type: Boolean, default: true },
    responseRate: { type: String, default: 'under24Hours' },
    responseTime: { type: String, default: 'Usually replies within a day' }
  },
  profileImage: {
    url: String,
    filename: String,
    originalName: String,
    size: Number,
    mimetype: String
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    github: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Prevent spam by checking for duplicate messages
ContactMessageSchema.index({ email: 1, message: 1, createdAt: 1 });

const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
const ContactInfo = mongoose.model('ContactInfo', ContactInfoSchema);

module.exports = { ContactMessage, ContactInfo };