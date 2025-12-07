import { ObjectId } from "mongodb"

 export type Author = {
    _id: ObjectId
    name: string
    nationality: string
    books: ObjectId[]
  }