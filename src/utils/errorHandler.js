/**
 * Formats API error messages into a user-friendly format.
 * @param {import('axios').AxiosError|Error|unknown} error
 * @returns {{ message: string, status?: number, errors?: Record<string, string> }}
 */
export function parseApiError(error) {
  if (error && typeof error === 'object' && 'response' in error && error.response) {
    const status = error.response.status;
    const data = error.response.data;

    let message = 'An unexpected error occurred';
    let fieldErrors = null;

    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      }

      if (data.errors && typeof data.errors === 'object') {
        fieldErrors = data.errors;
      }
    }

    return {
      message,
      status,
      errors: fieldErrors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Network error or backend server unavailable',
    };
  }

  return {
    message: 'An unknown error occurred',
  };
}
