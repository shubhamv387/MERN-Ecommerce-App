import { Types } from 'mongoose'
import UserModel from '../models/User.model'

const findById = (userId: Types.ObjectId) => UserModel.findById(userId)

const findByEmail = (email: string) => UserModel.findOne({ email })

const findByPhone = (phone: string) => UserModel.findOne({ phone })

const userServices = { findById, findByEmail, findByPhone }
export default userServices
