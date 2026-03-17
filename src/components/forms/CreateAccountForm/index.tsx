'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      const body = {
        email: data.email,
        password: data.password,
        name: [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || undefined,
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || 'There was an error creating the account.'
        setError(message)
        return
      }

      const redirectTo = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login({ email: data.email, password: data.password })
        clearTimeout(timer)
        if (redirectTo) router.push(redirectTo)
        else router.push(`/account?success=${encodeURIComponent('Account created successfully')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router, searchParams],
  )

  const inputWrap =
    'flex h-12 items-center justify-between gap-3 rounded-xl bg-white/90 px-4 text-[#3D3933]'

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <Label className="sr-only" htmlFor="firstName">
              First name
            </Label>
            <div className={inputWrap}>
              <span className="text-[#3D3933]/70">👤</span>
              <Input
                id="firstName"
                type="text"
                placeholder="Sato"
                className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#3D3933] placeholder:text-[#3D3933]/60 focus-visible:outline-none"
                {...register('firstName', { required: 'First name is required.' })}
              />
              <span className="text-sm text-[#3D3933]/60">✓</span>
            </div>
            {errors.firstName && <FormError message={errors.firstName.message} />}
          </FormItem>
          <FormItem>
            <Label className="sr-only" htmlFor="lastName">
              Last name
            </Label>
            <div className={inputWrap}>
              <span className="text-[#3D3933]/70">👤</span>
              <Input
                id="lastName"
                type="text"
                placeholder="Matsugawa"
                className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#3D3933] placeholder:text-[#3D3933]/60 focus-visible:outline-none"
                {...register('lastName', { required: 'Last name is required.' })}
              />
              <span className="text-sm text-[#3D3933]/60">✓</span>
            </div>
            {errors.lastName && <FormError message={errors.lastName.message} />}
          </FormItem>
        </div>

        <FormItem>
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <div className={inputWrap}>
            <span className="text-[#3D3933]/70">✉️</span>
            <Input
              id="email"
              type="email"
              placeholder="satomatsugawa@gmail.com"
              className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#3D3933] placeholder:text-[#3D3933]/60 focus-visible:outline-none"
              {...register('email', { required: 'Email is required.' })}
            />
            <span className="text-sm text-[#3D3933]/60">✓</span>
          </div>
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <div className={inputWrap}>
            <span className="text-[#3D3933]/70">🔒</span>
            <Input
              id="password"
              type="password"
              placeholder="Type your password here"
              className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#3D3933] placeholder:text-[#3D3933]/60 focus-visible:outline-none"
              {...register('password', { required: 'Password is required.' })}
            />
            <span className="text-sm text-[#3D3933]/60">✓</span>
          </div>
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="flex items-center justify-between gap-4 pt-0.5 text-[12px] text-[#E5DDCF]">
          <span>*Create a strong password</span>
          <Link
            href={`/login${allParams}`}
            className="underline underline-offset-4 text-[#FAF2DE] hover:text-white"
          >
            Log in here
          </Link>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          className="h-12 w-full max-w-sm rounded-xl bg-white px-10 text-[13px] font-semibold tracking-[0.12em] uppercase text-[#3D3933] shadow-md transition-colors hover:bg-[#FDF8F0] focus-visible:ring-2 focus-visible:ring-[#C46B5A]/50"
          disabled={loading}
          size="lg"
          type="submit"
          variant="default"
        >
          {loading ? 'Processing' : 'Register account'}
        </Button>
      </div>
    </form>
  )
}
