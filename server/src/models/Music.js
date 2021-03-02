const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  bit_rate: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  titleRomaji: {
    type: String,
  },
  artistRomaji: {
    type: String,
  },
});

export default mongoose.model('Music', musicSchema);
