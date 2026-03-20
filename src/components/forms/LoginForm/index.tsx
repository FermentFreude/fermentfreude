'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { Eye, EyeOff, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)
  const [remember, setRemember] = React.useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/account')
      } catch (_) {
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router],
  )

  return (
    <form className="font-sans" onSubmit={handleSubmit(onSubmit)}>
      <style>{`
        #email:-webkit-autofill,
        #email:-webkit-autofill:hover,
        #email:-webkit-autofill:focus,
        #password:-webkit-autofill,
        #password:-webkit-autofill:hover,
        #password:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.9) inset !important;
          -webkit-text-fill-color: #3D3933 !important;
          background-color: rgba(255,255,255,0.9) !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: #3D3933;
        }
      `}</style>
      <Message className="classes.message" error={error} />
      <div className="flex flex-col gap-4">
        <FormItem>
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <div className="flex h-11 items-center gap-2 rounded-xl bg-white/90 px-3">
            <Mail className="w-4 h-4 text-[#3D3933]/50 shrink-0" />
            <input
              id="email"
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
          <div className="flex h-11 items-center gap-2 rounded-xl bg-white/90 px-3">
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[#3D3933]/50 hover:text-[#3D3933] transition-colors cursor-pointer shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Type your password here"
              className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
              {...register('password', { required: 'Please provide a password.' })}
            />
          </div>
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="flex flex-row items-center justify-between gap-2 pt-1 text-[12px] font-sans text-[#E5DDCF]/85">
          <Link
            href={`/recover-password${allParams}`}
            className="underline underline-offset-4 hover:text-white"
          >
            Forgot your password?
          </Link>
          <Link
            href={`/create-account${allParams}`}
            className="underline underline-offset-4 hover:text-white"
          >
            Create an account Now
          </Link>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-[12px] font-sans text-[#FAF2DE]/90">
          <input
            id="remember-login"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full border border-[#FAF2DE]/50 text-[#FAF2DE]/90 text-xs"
          >
            {remember ? '✓' : ''}
          </span>
          <span>Remember my login</span>
        </label>
        <Button
          className="h-10 rounded-full bg-linear-to-b from-[#F8F4EB] to-[#EFE8DA] px-8 text-[11px] font-medium font-sans tracking-[0.18em] uppercase text-[#3D3933] shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-white/60 transition-colors focus-visible:ring-2 focus-visible:ring-[#F5F2EC]/60 hover:from-white hover:to-[#F3ECE0]"
          disabled={isLoading}
          size="default"
          type="submit"
          variant="default"
        >
          {isLoading ? 'Processing' : 'Enter account'}
        </Button>
      </div>
    </form>
  )
}
