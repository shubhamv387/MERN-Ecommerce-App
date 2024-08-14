import { CookieOptions, Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'
import UserModel from '../models/User.model'
import {
  comparePassword,
  encryptPassword,
  generateToken,
  generateTokens,
  generateAccessToken,
  verifyRefreshToken,
  UserPayloadType,
} from '../services/auth.services'
import { LoginUserType, RegisterUserType } from '../types/auth.types'
import userServices from '../services/user.services'
import BadRequestException from '../exceptions/BadRequest'
import InternalException from '../exceptions/InternalException'
import UnauthorizedException from '../exceptions/UnauthorizedException'
import HttpException from '../exceptions/root'
import ForbiddenException from '../exceptions/ForbiddenException'
import { UserDocument } from '../types/user.types'
import { JWT_SECRET_KEY } from '../secrets'
import { verify } from 'jsonwebtoken'
import { Types } from 'mongoose'
import handleValidationError from '../utils/handleValidationError'
import sendMail, { SendMailOptionsType } from '../utils/sendMail'

const cookieOptions: CookieOptions = {
  httpOnly: true,
  // secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, //'7d'
}

// @desc    Register a new User
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  handleValidationError(req)

  // 1. Getting the user data from req.body
  const userData = req.body as RegisterUserType

  // 2. Encrypt the password using bcryptjs
  const encryptedPass = await encryptPassword(userData.password)

  // 3. Creating a new instance of User model with user data
  const user = new UserModel({
    ...userData,
    password: encryptedPass,
  })

  // 4. Saving the user into the database
  await user.save()

  // 5. then getting the created user data from database using its _id
  const createdUser = await userServices.findById(user._id).select(['-__v'])

  // 6. If created user does not found that means new user is not created need to throw a server error
  if (!createdUser) throw new InternalException('Unable to register new user, please try again later')

  // 7. Generating new access and refresh tokens
  const { accessToken, refreshToken } = generateTokens({ userId: createdUser._id, role: createdUser.role })

  // 8. Return the created user and access token in response body but the refresh token in cookies
  res.cookie('jwt', refreshToken, cookieOptions)
  return res
    .status(201)
    .json({ success: true, message: 'User registration successful', user: createdUser, token: accessToken })
})

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  // 1. Check for the validation errors and if any error found return it back
  handleValidationError(req)

  // 2. Getting the user data from req.body
  const userData = req.body as LoginUserType

  // 3. Extracting the existing user from database
  let foundUser: UserDocument | null
  if (userData.email) foundUser = await userServices.findByEmail(userData.email).select(['password'])
  else foundUser = await userServices.findByPhone(userData.phone).select(['password'])

  if (!foundUser) throw new BadRequestException('Invalid credentials')

  // 4. Matching the hashed password with given password
  const isMatchedPassword = await comparePassword(userData.password, foundUser.password)

  // 5. if password is not matching return bad request error
  if (!isMatchedPassword) throw new BadRequestException('Invalid credentials')

  // 6. Generating new access and refresh tokens
  const { accessToken, refreshToken } = generateTokens({ userId: foundUser!._id, role: foundUser!.role })

  // 7. Return the success message and access token in response body but the refresh token in cookies
  res.cookie('jwt', refreshToken, cookieOptions)
  return res.status(200).json({ success: true, message: 'successfully logged in', token: accessToken })
})

// @desc    Refresh Token
// @route   GET /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const cookie = req.cookies
  if (!cookie?.jwt) throw new ForbiddenException('Forbidden')

  const decoded = verifyRefreshToken(cookie.jwt) as UserPayloadType
  const foundUser = await userServices.findById(decoded.userId).select('role')
  if (!foundUser) throw new UnauthorizedException('Unauthorized')

  const accessToken = generateAccessToken({ userId: foundUser._id, role: foundUser.role })

  return res.status(200).json({ token: accessToken })
})

// @desc    Logout User
// @route   POST /api/v1/auth/logout
// @access  Public
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookie = req.cookies

  if (!cookie?.jwt) throw new HttpException('No Content', 204)
  res.clearCookie('jwt', { expires: new Date(0) })
  return res.status(200).json({ success: true, message: 'Logout successful' })
})

// @desc    Reset Password using email --> sending token valid for 15m
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const sendResetPassLink = asyncHandler(async (req: Request, res: Response) => {
  // 1. Check for the validation errors and if any error found return it back
  handleValidationError(req)

  // 2. Getting the user data from req.body
  const userData: { email: string; phone: string } = req.body

  // 3. Extracting the existing user from database
  let foundUser: UserDocument | null
  if (userData.email) foundUser = await userServices.findByEmail(userData.email)
  else foundUser = await userServices.findByPhone(userData.phone!)

  if (!foundUser) throw new BadRequestException('User does not exists')

  const token = generateToken({ userId: foundUser._id }, JWT_SECRET_KEY, '15m')

  // this will be the frontend reset password link attaching token with it
  const path = `http://localhost:3500/reset-password?token=${token}`

  const htmlContent = `<p><b>Please click the link given below to reset your password</b></p><a href="${path}">Reset Password</a>`

  const sendMailOptions: SendMailOptionsType = {
    subject: 'Reset password link',
    textContent: 'Click here to reset your password',
    htmlContent,
    receivers: [{ name: foundUser.firstName || '', email: foundUser.email }],
  }

  await sendMail(sendMailOptions)

  return res
    .status(200)
    .json({ success: true, message: 'Reset password link sent successfully on your email' })
})

// @desc    Reset Password using email or phone
// @route   PUT /api/v1/auth/reset-password?token=${token}
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  handleValidationError(req)

  const userData: { password: string; confirmPassword: string } = req.body
  const token: string = req.query.token as string

  let decode
  try {
    decode = verify(token, JWT_SECRET_KEY) as { userId: Types.ObjectId }
  } catch (error: any) {
    throw new BadRequestException('Link expired! Request new link')
  }

  const hashedPassword = await encryptPassword(userData.password)

  await UserModel.findByIdAndUpdate(decode.userId, { password: hashedPassword }, { new: true })

  return res.status(200).json({ success: true, message: 'Password updated successfully' })
})
