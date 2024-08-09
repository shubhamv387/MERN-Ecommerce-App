import mongoose, { Document } from 'mongoose'

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  phone?: string
  firstName?: string
  lastName?: string
  profileUrl?: string
  gender?: 'male' | 'female' | 'other'
  role: 'admin' | 'customer'
  createdAt?: Date
  updatedAt?: Date
}
