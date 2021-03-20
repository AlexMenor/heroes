import { Location } from './location.type';

export interface Persistence {
  writeLocation(location: Location): Promise<void>;
}

export class UnknownError implements Error {
  name: string;
  message: string;

  constructor() {
    this.name = 'Unknown Error';
    this.message = 'An unknown error ocurred interacting with the database';
  }
}

export class ConflictError implements Error {
  name: string;
  message: string;

  constructor() {
    this.name = 'Conflict Error';
    this.message = 'Users location was already being updated, try again';
  }
}
