import { EncryptStorage } from 'encrypt-storage'

const key = import.meta.env.VITE_STORAGE_KEY || crypto.randomUUID()
const encryptStorage = new EncryptStorage(key, {
  doNotParseValues: true
})

export { encryptStorage }
