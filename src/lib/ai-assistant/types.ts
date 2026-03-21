export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIRequestBody {
  message: string
  conversationHistory?: AIMessage[]
  collection?: string
  documentId?: string
}

export interface AIContext {
  timestamp: string
  userRole: string
  collection?: {
    slug: string
    fields: Array<{
      name: string
      type: string
      label?: string | Record<string, string>
      required?: boolean
      maxLength?: number
      minLength?: number
    }>
  }
  currentDocument?: {
    id: string
    title?: string
    description?: string
    status?: string
  }
}

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
}
