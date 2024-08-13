export type RegisterUserType = {
  email: string
  password: string
  phone?: string
  firstName?: string
  lastName?: string
}

export type LoginUserType = {
  email: string
  password: string
  phone: string
}

export type RegistrationInputTypes = {
  field: 'email' | 'password' | 'phone' | 'firstName' | 'lastName'
  required?: boolean
}
