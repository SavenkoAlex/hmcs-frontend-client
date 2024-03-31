export type Chat = {
  id: string
  name: string,
  messages: Message[]
}

export type Message = {
  id: string,
  sender: string
  text: string
  date: string
}

export type Data = {
  messages: Message[]
}
