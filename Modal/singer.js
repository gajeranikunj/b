const mongoose = require('mongoose');

const singerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  musiclist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music',
    required: false
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Singer = mongoose.model('Singer', singerSchema);

module.exports = Singer; 