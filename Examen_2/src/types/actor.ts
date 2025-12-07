import { ObjectId } from "mongodb"

export type Actor = {
    _id: ObjectId
    name: string
    age: number
    filmography: string[]
  }