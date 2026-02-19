import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'driver';
  isDriver?: boolean;
  pushSubscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    role: {
      type: String,
      enum: ['user', 'driver'],
      default: 'user',
    },
    isDriver: {
      type: Boolean,
      default: false,
    },
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

