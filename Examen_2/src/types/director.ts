import { ObjectId } from "mongodb"

export type Director = {
    _id: ObjectId
    name: string
    nationality: string
    movies: string[]
  }