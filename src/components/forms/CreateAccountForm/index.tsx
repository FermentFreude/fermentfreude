'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { Eye, EyeOff, Mail, User } from 'lucide-react'
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
    'flex h-11 items-center gap-2 rounded-xl bg-white/90 px-3'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="font-sans" onSubmit={handleSubmit(onSubmit)}>
      <style>{`
        #firstName:-webkit-autofill, #firstName:-webkit-autofill:hover, #firstName:-webkit-autofill:focus,
        #lastName:-webkit-autofill, #lastName:-webkit-autofill:hover, #lastName:-webkit-autofill:focus,
        #create-email:-webkit-autofill, #create-email:-webkit-autofill:hover, #create-email:-webkit-autofill:focus,
        #create-password:-webkit-autofill, #create-password:-webkit-autofill:hover, #create-password:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.9) inset !important;
          -webkit-text-fill-color: #3D3933 !important;
          background-color: rgba(255,255,255,0.9) !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: #3D3933;
        }
      `}</style>
      <Message error={error} />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <Label className="sr-only" htmlFor="firstName">
              First name
            </Label>
            <div className={inputWrap}>
              <User className="w-4 h-4 text-[#3D3933]/50 shrink-0" />
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
                {...register('firstName', { required: 'First name is required.' })}
              />
            </div>
            {errors.firstName && <FormError message={errors.firstName.message} />}
          </FormItem>
          <FormItem>
            <Label className="sr-only" htmlFor="lastName">
              Last name
            </Label>
            <div className={inputWrap}>
              <User className="w-4 h-4 text-[#3D3933]/50 shrink-0" />
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
                {...register('lastName', { required: 'Last name is required.' })}
              />
            </div>
            {errors.lastName && <FormError message={errors.lastName.message} />}
          </FormItem>
        </div>

        <FormItem>
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <div className={inputWrap}>
            <Mail className="w-4 h-4 text-[#3D3933]/50 shrink-0" />
            <input
              id="create-email"
              type="email"
              placeholder="your@email.com"
              className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
              {...register('email', { required: 'Email is required.' })}
            />
          </div>
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <div className={inputWrap}>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[#3D3933]/50 hover:text-[#3D3933] transition-colors cursor-pointer shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <input
              id="create-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Type your password here"
              className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
              {...register('password', { required: 'Password is required.' })}
            />
          </div>
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="flex items-center justify-between gap-4 pt-0.5 text-[12px] font-sans text-[#E5DDCF]">
          <span>*Create a strong password</span>
          <Link
            href={`/login${allParams}`}
            className="underline underline-offset-4 text-[#FAF2DE] hover:text-white"
          >
            Log in here
          </Link>
        </div>
      </div>

      <div className="mt-7 flex justify-center">
        <Button
          className="h-10 w-full max-w-sm rounded-xl bg-white px-8 text-[11px] font-semibold font-sans tracking-[0.12em] uppercase text-[#3D3933] shadow-md transition-colors hover:bg-[#FDF8F0] focus-visible:ring-2 focus-visible:ring-[#C46B5A]/50"
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
