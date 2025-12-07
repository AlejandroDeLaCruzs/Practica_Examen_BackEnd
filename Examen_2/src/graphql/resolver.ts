import { IResolvers } from "@graphql-tools/utils";
import { ObjectId } from "mongodb";
import { getDB } from "../db/db";
import { Movie } from "../types/movie";
import { Director } from "../types/director";
import { Actor } from "../types/actor";

const directorColletion = "director";
const actorColletion = "actor";
const movieCollection = "movies";
const reviewsCollection = "reviews";

export const resolvers: IResolvers = {
  Query: {
    movies: async (_, __) => {
      return getDB().collection(movieCollection).find().toArray();
    },
    movie: async (_, { id }: { id: string }) => {
      const movie = await getDB()
        .collection(movieCollection)
        .findOne({ _id: new ObjectId(id) });
      if (!movie) throw new Error("no existe movie con ese ID");
      return movie;
    },
    actors: async (_, __) => {
      return getDB().collection(actorColletion).find().toArray();
    },
    actor: async (_, { id }: { id: string }) => {
      const movie = await getDB()
        .collection(actorColletion)
        .findOne({ _id: new ObjectId(id) });
      if (!movie) throw new Error("no existe actor con ese ID");
      return movie;
    },
    directors: async (_, __) => {
      return getDB().collection(directorColletion).find().toArray();
    },
    director: async (_, { id }: { id: string }) => {
      const movie = await getDB()
        .collection(directorColletion)
        .findOne({ _id: new ObjectId(id) });
      if (!movie) throw new Error("no existe director con ese ID");
      return movie;
    },
  },

  Mutation: {
    addDirector: async (
      _,
      { name, nationality }: { name: string; nationality: string }
    ) => {
      const result = await getDB().collection(directorColletion).insertOne({
        name,
        nationality,
      });
      return getDB()
        .collection(directorColletion)
        .findOne({ _id: result.insertedId });
    },

    addActor: async (_, { name, age }: { name: string; age: number }) => {
      if (age < 15) throw new Error("La edad debe ser superior a 15 años");
      const result = await getDB().collection(actorColletion).insertOne({
        name,
        age,
      });
      return getDB()
        .collection(actorColletion)
        .findOne({ _id: result.insertedId });
    },

    addMovie: async (
      _,
      {
        title,
        year,
        directorId,
        castIds,
      }: { title: string; year: number; directorId: string; castIds: string[] }
    ) => {
      const castObjectIds = castIds.map((id) => new ObjectId(id));
      const result = await getDB()
        .collection(movieCollection)
        .insertOne({
          title,
          year,
          director: directorId,
          cast: castIds,
          reviews: []
        });

      await getDB()
        .collection(directorColletion)
        .updateOne(
          { _id: new ObjectId(directorId) },
          { $addToSet: { movies: result.insertedId.toString() } }
        );

      await getDB()
        .collection(actorColletion)
        .updateMany(
          { _id: { $in: castObjectIds } },
          { $addToSet: { filmography: result.insertedId.toString() } }
        );

      return getDB()
        .collection(movieCollection)
        .findOne({ _id: result.insertedId });
    },
    addReview: async (
      _,
      {
        movieId,
        criticName,
        comment,
        rating,
      }: {
        movieId: string;
        criticName: string;
        comment: string;
        rating: number;
      }
    ) => {
      const movie = await getDB()
        .collection(movieCollection)
        .findOne({ _id: new ObjectId(movieId) });
      if (!movie) throw new Error("No hay movie con ese id");
      const result = await getDB().collection(reviewsCollection).insertOne({
        movieId,
        criticName,
        comment,
        rating,
      });
      return getDB()
        .collection(reviewsCollection)
        .findOne({ _id: result.insertedId });
    },
  },

  Movie: {
    director: async (parent: Movie) => {
      return getDB()
        .collection(directorColletion)
        .findOne({ _id: new ObjectId(parent.director) });
    },
    cast: async (parent: Movie) => {
      const ids = parent.cast.map((id) => new ObjectId(id));
      return getDB()
        .collection(actorColletion)
        .find({ _id: { $in: ids } })
        .toArray();
    },
    reviews: async (parent: Movie) => {
      return getDB()
        .collection(reviewsCollection)
        .find({ movieId: parent._id.toString() })
        .toArray();
    },
  },
  Director: {
    movies: async (parent: Director) => {
      const idToObjectID = parent.movies.map((id) => new ObjectId(id));
      return getDB()
        .collection(movieCollection)
        .find({ _id: { $in: idToObjectID } })
        .toArray();
    },
  },
  Actor: {
    filmography: async (parent: Actor) => {
      const idToObjectID = parent.filmography.map((id) => new ObjectId(id));
      return getDB()
        .collection(movieCollection)
        .find({ _id: { $in: idToObjectID } })
        .toArray();
    },
  },
  Review: {
    movie: async (parent) => {
      return getDB()
        .collection(movieCollection)
        .findOne({ _id: new ObjectId(parent.movieId) });
    },
  },
};
