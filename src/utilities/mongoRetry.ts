type MongoLikeError = Error & { code?: string }

function isTransientMongoError(error: unknown): boolean {
  const code = (error as MongoLikeError)?.code
  return code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ECONNREFUSED'
}

/** Retry Payload/Mongo reads once on transient connection drops (Atlas M0 idle timeout). */
export async function withMongoRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isTransientMongoError(error) || attempt === retries) throw error
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)))
    }
  }

  throw lastError
}
