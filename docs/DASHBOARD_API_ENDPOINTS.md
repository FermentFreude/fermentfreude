# API Endpoints Implementation Guide

## Overview

This guide helps you implement the API endpoints needed for the dashboard to work fully with your Payload CMS setup.

## Authentication Endpoints

### Already Implemented ✅
Your Payload CMS already has:
- `POST /api/users/login`
- `POST /api/users/create` (register)
- `GET /api/users/me` (current user)
- `POST /api/users/logout`

## Endpoints to Create

### 1. Update Profile

**File**: `src/app/api/users/update-profile/route.ts`

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email } = await request.json()

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        name: name || user.name,
        email: email || user.email,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
```

### 2. Change Password

**File**: `src/app/api/users/change-password/route.ts`

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Update password (Payload handles hashing)
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: newPassword,
      },
    })

    return NextResponse.json({
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
```

### 3. Address Management

**File**: `src/app/api/addresses/route.ts` (for POST)

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addressData = await request.json()

    const address = await payload.create({
      collection: 'addresses',
      data: {
        ...addressData,
        customer: user.id,
      },
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}
```

**File**: `src/app/api/addresses/[id]/route.ts` (for PATCH/DELETE)

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const address = await payload.findByID({
      collection: 'addresses',
      id: params.id,
    })

    if (address.customer !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    const updated = await payload.update({
      collection: 'addresses',
      id: params.id,
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const address = await payload.findByID({
      collection: 'addresses',
      id: params.id,
    })

    if (address.customer !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await payload.delete({
      collection: 'addresses',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
```

### 4. Return Requests (Optional)

**File**: `src/app/api/return-requests/route.ts`

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId, reason, description } = await request.json()

    // Verify order belongs to user
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (order.customer !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Generate RMA number
    const rmaNumber = `RMA-${Date.now()}`

    const returnRequest = await payload.create({
      collection: 'returnRequests', // Create this collection if it doesn't exist
      data: {
        order: orderId,
        customer: user.id,
        reason,
        description,
        rmaNumber,
        status: 'pending',
        requestDate: new Date(),
      },
    })

    return NextResponse.json(returnRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating return request:', error)
    return NextResponse.json(
      { error: 'Failed to create return request' },
      { status: 500 }
    )
  }
}
```

## Payload CMS Collection: Addresses

If you don't have an Addresses collection, create one:

**File**: `src/collections/Addresses.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  auth: false,
  admin: {
    useAsTitle: 'street',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'street',
      type: 'text',
      required: true,
    },
    {
      name: 'streetSecond',
      type: 'text',
      label: 'Apartment, suite, etc.',
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'zipCode',
      type: 'text',
      required: true,
    },
    {
      name: 'state',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'telephone',
      type: 'text',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Home', value: 'home' },
        { label: 'Work', value: 'work' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'home',
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
```

Add to your `src/payload.config.ts`:
```typescript
import { Addresses } from '@/collections/Addresses'

// Then add to collections array:
collections: [
  // ... other collections
  Addresses,
]
```

## Testing Endpoints

### Test with cURL

```bash
# Create address
curl -X POST http://localhost:3000/api/addresses \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Portland",
    "zipCode": "97204",
    "country": "USA"
  }'

# Update profile
curl -X POST http://localhost:3000/api/users/update-profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'

# Change password
curl -X POST http://localhost:3000/api/users/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass",
    "newPassword": "newpass1234"
  }'
```

## Error Handling Best Practices

All endpoints should:
1. Check authentication (`if (!user) return 401`)
2. Verify ownership for sensitive operations
3. Validate input data
4. Return appropriate status codes
5. Log errors for debugging
6. Return meaningful error messages

## Security Considerations

✅ **Already Protected**:
- Authentication required for all endpoints
- Ownership verification
- CSRF protection (via Payload)

✅ **To Implement**:
- Rate limiting (recommend `next-rate-limit`)
- Input sanitization
- SQL injection prevention (Payload handles this)
- Password strength validation
- Email verification for changes

## Testing the Dashboard

1. **Setup**: Create a user account at `/create-account`
2. **Login**: Go to `/login`
3. **Navigate**: `/account` should load with dashboard
4. **Test Forms**: Update profile, add address
5. **Check API**: Monitor network tab in browser DevTools

## Next Steps

1. Create the API route files above
2. Create the Addresses collection in Payload
3. Run `pnpm generate:types` to regenerate types
4. Test endpoints with the dashboard
5. Add error handling and validation  
6. Implement rate limiting
7. Add audit logging

---

**Status**: Ready to Implement ✅
