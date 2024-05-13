export type UserRole = 'user' | 'worker'

export type User = {
  login: string,
  username: string,
  role: unknown,
  type: UserRole,
  id: string
}
