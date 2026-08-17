import { APIError } from 'payload'

const MIN_PASSWORD_LENGTH = 8

/**
 * Payload's built-in password validator defaults to a 3-character minimum
 * and there is no `auth.minLength` config to raise it. `beforeOperation` is
 * the only hook point that sees the plaintext password before it's hashed —
 * fires for account creation, profile updates, and password-reset alike.
 */
export const enforcePasswordStrength = async ({
  args,
  operation,
}: {
  // Payload's BeforeOperationArg is a large discriminated union keyed by
  // operation; `args.data` only exists on the create/update/resetPassword
  // branches this hook actually cares about.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any
  operation: string
}) => {
  if (operation !== 'create' && operation !== 'update' && operation !== 'resetPassword') {
    return args
  }

  const password = args?.data?.password
  if (typeof password === 'string' && password.length > 0 && password.length < MIN_PASSWORD_LENGTH) {
    throw new APIError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400)
  }

  return args
}
