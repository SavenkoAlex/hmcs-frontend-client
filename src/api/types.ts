export type UserRole = 'user' | 'worker'

export type User = {
  login: string,
  username: string,
  role: unknown,
  type: UserRole,
  id: string
}
export type LoginResponse = {
  user: User,
  accessToken: string 
}
