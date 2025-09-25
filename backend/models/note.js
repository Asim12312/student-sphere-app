const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  originalName: {       
    type: String
  },
  extension: {           
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Note', noteSchema);
