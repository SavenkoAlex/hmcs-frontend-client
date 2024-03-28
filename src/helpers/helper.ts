import { 
  ElementScale, 
  SidePosition,
  Maybe,
  ValidationError,
  SessionStorageKeys,
  User,
  storeUserKeyMap
} from '@/global/global'
import { store } from '@/store'

import { AES } from 'crypto-js'

export const getSizeHash = (small: string, medium: string, large: string) => {
  return {
    [ElementScale.LARGE]: large,
    [ElementScale.MEDIUM]: medium,
    [ElementScale.SMALL]: small
  }
}

type FlexOrientation = {
  'flex-direction': 'row' | 'column',
  'justify-content': 'flex-start' | 'flex-end'
}

export const getFlexOrientation = (side: SidePosition): FlexOrientation => {
  const direction: 'row' | 'column' = side === SidePosition.LEFT || side === SidePosition.RIGHT
    ? 'row'
    : 'column'

  const justify: 'flex-start' | 'flex-end' = side === SidePosition.TOP || side === SidePosition.LEFT
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
    const value = user[userKey]
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
