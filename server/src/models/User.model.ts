import mongoose from 'mongoose'
import { UserDocument } from '../types/user.types'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    phone: { type: String, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    profileUrl: { type: String },
    role: {
      type: String,
      enum: { values: ['admin', 'customer'] },
      default: 'customer',
      required: true,
    },
    gender: { type: String, enum: { values: ['male', 'female', 'other'] } },
  },
  { timestamps: true },
)

export default mongoose.model<UserDocument>('User', userSchema)
