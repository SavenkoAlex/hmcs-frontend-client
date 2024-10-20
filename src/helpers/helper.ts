import { 
  ElementScale, 
  SidePosition,
  Maybe,
  ValidationError,
  SessionStorageKeys,
  User,
  storeUserKeyMap,
  Output
} from '@/types/global'

import { AES } from 'crypto-js'

export const getSizeHash = () => {
  return {
    [ElementScale.SMALLEST]: 'xx-small',
    [ElementScale.SMALLER]: 'x-small',
    [ElementScale.SMALL]: 'small',
    [ElementScale.MEDIUM]: 'medium',
    [ElementScale.LARGE]: 'large',
    [ElementScale.LARGER]: 'x-large',
    [ElementScale.LARGEST]: 'xx-large'
  }
}

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
type FlexJustify = 'flex-start' | 'flex-end'

type FlexOrientation = {
  'flex-direction': FlexDirection
  'justify-content': FlexJustify
}

export const getFlexOrientation = (side: SidePosition): FlexOrientation => {
  const direction: FlexDirection = side === SidePosition.LEFT
    ? 'row'
    : side === SidePosition.RIGHT
      ? 'row-reverse'
      : side === SidePosition.TOP
        ? 'column'
        : 'column-reverse'

  const justify: FlexJustify = side === SidePosition.TOP || side === SidePosition.LEFT
    ? 'flex-start'
    : 'flex-end'

  return {
    'flex-direction': direction,
    'justify-content': justify
  }
}

/**
 * empty field check
 * @param value 
 * @returns 
 */
export const emptyfieldValidation = (value: Maybe <string>) => {

  if (value && value?.length) {
    return false
  }

  return ValidationError.EMPTY_FIELD
}

export const setSecretKey = () => {
  const randomString = globalThis.crypto.getRandomValues(new Uint8Array()).toString()
  globalThis.sessionStorage.setItem(SessionStorageKeys.KEY, randomString)
  return randomString
}

export const getSecretKey = () => {
  const secretKey = globalThis.sessionStorage.getItem(SessionStorageKeys.KEY)
  return secretKey
}

export const encrypt = (text: string) => {
  if (!text) {
    return false
  }

  const key = getSecretKey()
  if (!key) {
    return false
  }

  const encrypted = AES.encrypt(text, key).toString()

  return encrypted
}

export const decrypt = (cipher: string) => {
  const key = getSecretKey()

  if (!key) {
    return false
  }

  const decrypted = AES.decrypt(cipher, key).toString()

  return decrypted
}

export const setLocalStorageUser = (user: User) => {
  
  for (const property in user) {
    const userKey: keyof User = property as keyof User
    const value = user[userKey] ? String(user[userKey]) : null
    const storageKey =  storeUserKeyMap[userKey]

    if (!storageKey || !value) {
      continue
    }

    const encrypted = encrypt(value)

    if (!encrypted) {
      return false
    }

    globalThis.localStorage.setItem(storageKey, encrypted)
  }

  return true
}

export const isAuthentificated = () => {
  const secret = globalThis.sessionStorage.getItem(SessionStorageKeys.KEY)
  const accessToken = globalThis.localStorage.getItem('accessToken')
  const user = globalThis.localStorage.getItem(storeUserKeyMap.id)

  return secret && accessToken && user
}

/**
 * adds zeros as a filler (mask)
 * @param value 
 * @returns 
 */
export function formatTime (value: number) {
  return value < 10
    ? 0 + value
    : String(value) 
}

/** log console messages depends on mode */
export function printf (data: unknown, type: Output = 'log'): void {
  const print: Record <Output, (data: unknown) => void> = {
    log: (data) => console.log(data),
    warn: (data) => console.warn(data),
    error: (data) => console.error(data)
  }

  if (!import.meta.env.PROD) {
    print[type](data)
  }
}

/**
 * obtains env variable depends on mode
 * @param envName 
 * @param defaultValue 
 * @returns 
 */
export function getEnvVar <T extends string | undefined>(envName: string, defaultValue?: T): T extends string ? string : string | undefined {
  const isProdMode = import.meta.env.PROD
  const value = isProdMode ? process.env[envName] : import.meta.env[envName]
  return value || defaultValue
}
