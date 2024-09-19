import { EncryptStorage } from 'encrypt-storage'
import process from 'process'
const key = import.meta.env.VITE_STORAGE_KEY || crypto.randomUUID()
const encryptStorage = new EncryptStorage(key)

export { encryptStorage }
