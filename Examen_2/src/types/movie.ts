import { ObjectId } from "mongodb"

export type Movie = {
    _id: ObjectId,
    title: string
    year: number
    director: string
    cast: string[]
    reviews: string[]
}