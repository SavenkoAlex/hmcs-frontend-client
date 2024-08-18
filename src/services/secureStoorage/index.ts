import { EncryptStorage } from 'encrypt-storage'

const key = import.meta.env.STORAGE_KEY || crypto.randomUUID()

const encryptStorage = new EncryptStorage(key)

export { encryptStorage }
