const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema(
  {
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    mediaUrl: {
      type: String,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    songIconUrl: {
      type: String,
      default: ''
    },
    paragraph: {
      type: String,
      required: true
    },
    chapter: {
      type: String,
      default: 'how_we_met',
      index: true
    },
    title: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
