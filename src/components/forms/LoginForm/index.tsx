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
import React, { useCallback, useRef } from 'react'
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
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <Message className="classes.message" error={error} />
      <div className="flex flex-col gap-4">
        <FormItem>
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <div className="flex h-12 items-center justify-between gap-3 rounded-[6px] bg-[rgba(250,242,222,0.16)] px-4">
            <span className="text-sm text-[#FAF2DE] opacity-90">✉️</span>
            <Input
              id="email"
              type="email"
              placeholder="satomatsugawa@gmail.com"
              className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#FAF2DE] placeholder:text-[#FAF2DE]/70 transition-colors hover:bg-[rgba(250,242,222,0.08)] focus-visible:outline-none"
              {...register('email', { required: 'Email is required.' })}
            />
            <span className="text-sm text-[#FAF2DE] opacity-90">✓</span>
          </div>
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <div className="flex h-12 items-center justify-between gap-3 rounded-[6px] bg-[rgba(250,242,222,0.16)] px-4">
            <span className="text-sm text-[#FAF2DE] opacity-90">🔒</span>
            <Input
              id="password"
              type="password"
              placeholder="Type your password here"
              className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#FAF2DE] placeholder:text-[#FAF2DE]/70 transition-colors hover:bg-[rgba(250,242,222,0.08)] focus-visible:outline-none"
              {...register('password', { required: 'Please provide a password.' })}
            />
            <span className="text-sm text-[#FAF2DE] opacity-90">✓</span>
          </div>
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="flex items-center justify-between pt-0.5 text-[12px] text-[#E5DDCF]/85">
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

      <div className="mt-8 flex items-center justify-between gap-6">
        <label className="flex cursor-pointer items-center gap-3 text-[13px] text-[#FAF2DE]/90">
          <input
            id="remember-login"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full border border-[#FAF2DE]/50 text-[#FAF2DE]/90"
          >
            {remember ? '✓' : ''}
          </span>
          <span>Remember my login</span>
        </label>
        <Button
          className="h-12 rounded-full bg-gradient-to-b from-[#F8F4EB] to-[#EFE8DA] px-10 text-[13px] font-medium tracking-[0.18em] uppercase text-[#3D3933] shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-white/60 transition-colors focus-visible:ring-2 focus-visible:ring-[#F5F2EC]/60 hover:from-white hover:to-[#F3ECE0]"
          disabled={isLoading}
          size="lg"
          type="submit"
          variant="default"
        >
          {isLoading ? 'Processing' : 'Enter account'}
        </Button>
      </div>
    </form>
  )
}
