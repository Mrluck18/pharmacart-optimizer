import { Error as MongooseError } from 'mongoose';

/** Percorsi dei campi che non superano la validazione del documento, in ordine alfabetico. */
export const invalidPaths = async (doc: { validate(): Promise<unknown> }): Promise<string[]> => {
  try {
    await doc.validate();

    return [];
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return Object.keys(error.errors).sort();
    }

    throw error;
  }
};
