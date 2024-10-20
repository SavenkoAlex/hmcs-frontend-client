import { EncryptStorage } from 'encrypt-storage'
import { getEnvVar } from '@/helpers/helper'

const key = getEnvVar('VITE_STORAGE_KEY', crypto.randomUUID())
const encryptStorage = new EncryptStorage(key, {
  doNotParseValues: true
})

export { encryptStorage }
