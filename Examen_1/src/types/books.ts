import { ObjectId } from "mongodb";
import { Author } from "./author";

export type Book = {
  _id: ObjectId;
  title: string;
  author: Author;
  publishedYear: number;
  genres: [string];
  available: boolean;
};
