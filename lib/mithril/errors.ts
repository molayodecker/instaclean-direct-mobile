export class MithrilTransportError extends Error {
  constructor(message = 'mithril_transport_error') {
    super(message);
    this.name = 'MithrilTransportError';
  }
}

export class MithrilApiError extends Error {
  status: number;
  code: string;
  details?: string;

  constructor(status: number, code: string, details?: string) {
    super(code);
    this.name = 'MithrilApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function authErrorMessage(code: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Invalid email or password.';
    case 'password_not_set':
      return 'This account needs a password before you can sign in.';
    case 'forbidden':
    case 'invalid_user':
      return 'You do not have admin access.';
    case 'invalid_otp':
      return 'That code is incorrect.';
    case 'otp_expired':
      return 'That code expired. Request a new one.';
    case 'database_unavailable':
      return 'Instaclean is temporarily unavailable. Try again.';
    default:
      return 'Could not sign in. Please try again.';
  }
}
