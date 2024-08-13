import mongoose, { Document } from 'mongoose'

export interface IUser {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  profileUrl?: string
  gender?: Gender
  role: Role
  createdAt?: Date
  updatedAt?: Date
}

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  phone?: string
  firstName?: string
  lastName?: string
  profileUrl?: string
  gender?: Gender
  role: Role
  createdAt?: Date
  updatedAt?: Date
}

export enum Role {
  Admin = 'admin',
  Customer = 'customer',
}

export enum Gender {
  M = 'male',
  F = 'female',
  O = 'others',
}
