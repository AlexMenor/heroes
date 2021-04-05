export type ErrorType = 'Unknown Error' | 'Conflict Error';

export class TypedError implements Error {
  name: ErrorType;
  message: string;

  constructor(name: ErrorType, message: string) {
    this.name = name;
    this.message = message;
  }
}

export class UnknownError implements TypedError {
  name: ErrorType;
  message: string;

  constructor() {
    this.name = 'Unknown Error';
    this.message = 'An unknown error ocurred';
  }
}

export class ConflictError implements Error {
  name: ErrorType;
  message: string;

  constructor(message: string) {
    this.name = 'Conflict Error';
    this.message = message;
  }
}
