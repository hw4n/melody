import { model, Schema, Document } from 'mongoose';

// primitive music interface
export interface IMusic {
  duration: number;
  size: number;
  bitrate: number;
  title: string;
  album: string;
  artist: string;
  filepath: string;
  romaji?: {
    title?: string;
    artist?: string;
  };
}

// interface for the mongoose model
export interface IStoredMusic extends IMusic, Document {
  lyrics?: string;
  synced?: boolean;
}

const musicSchema: Schema = new Schema({
  duration: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  bitrate: {
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
  filepath: {
    type: String,
    required: true,
  },
  romaji: {
    title: {
      type: String,
    },
    artist: {
      type: String,
    },
  },
  lyrics: {
    type: String,
  },
  synced: {
    type: Boolean,
  },
});

export default model<IStoredMusic>('Music', musicSchema);
