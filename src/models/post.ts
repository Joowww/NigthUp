import { Schema, model, Types } from 'mongoose';

export interface IPost {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  event?: Types.ObjectId;
  caption: string;
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  location?: string;
  tags: Types.ObjectId[];
  likes: Types.ObjectId[];
  comments: {
    user: Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  shares: number;
  views: number;
  isPublic: boolean;
  music?: {
    title: string;
    artist: string;
    cover: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    },
    caption: {
      type: String,
      required: true,
      maxlength: 2200
    },
    media: [{
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      thumbnail: {
        type: String
      }
    }],
    location: {
      type: String
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        maxlength: 1000
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    shares: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    music: {
      title: { type: String },
      artist: { type: String },
      cover: { type: String }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ event: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: -1 });

export const Post = model<IPost>('Post', postSchema);
export default Post;