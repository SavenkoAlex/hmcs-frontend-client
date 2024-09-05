export type LoginStatus = {
  message: string,
  success: boolean
}

export type Data = {
  login: string,
  password: string,
  loginStatus: LoginStatus | null
}
