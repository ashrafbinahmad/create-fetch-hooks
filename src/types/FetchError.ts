/**
 * A custom error class for Fetch API errors, including HTTP and network errors.
 * @example
 * throw new FetchError("HTTP error! Status: 404", response, 404);
 */
export class FetchError extends Error {
    /** The Fetch API Response object, if available. */
    response: Response | null;
    /** The HTTP status code, if applicable. */
    status: number | null;
  
    /**
     * Creates a new FetchError instance.
     * @param message The error message.
     * @param response The Fetch API Response object, if available.
     * @param status The HTTP status code, if applicable.
     */
    constructor(message: string, response: Response | null = null, status: number | null = null) {
      super(message);
      this.name = 'FetchError';
      this.response = response;
      this.status = status;
    }
  }