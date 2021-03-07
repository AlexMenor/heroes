import { Location } from './location.type';

export interface Persistence {
  writeLocation(location: Location): Promise<void>;
}

export class UnknownError implements Error {
  name: string;
  message: string;
  stack?: string | undefined;

  constructor(stack?: string | undefined) {
    this.name = 'Unknown Error';
    this.message = 'An unknown error ocurred interacting with the database';
    this.stack = stack;
  }
}
