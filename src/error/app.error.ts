// errors/app.error.ts

// 1. Base class — hindari duplikasi statusCode di setiap class
export abstract class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly isOperational = true, // beda dari bug/crash tak terduga
  ) {
    super(message);
    this.name = this.constructor.name; // otomatis ambil nama class
    Error.captureStackTrace(this, this.constructor); // stack trace lebih bersih
  }
}

// 2. Specific errors extend AppError
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized!") {
    super(401, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, `${resource} tidak ditemukan!`);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden!") {
    super(403, message);
  }
}
