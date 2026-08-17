'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  password: string
  passwordConfirm: string
}

type Props = {
  token: string
}

export const ResetPasswordForm: React.FC<Props> = ({ token }) => {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [error, setError] = useState('')

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await resetPassword({ password: data.password, passwordConfirm: data.passwordConfirm, token })
        router.push('/account')
      } catch (_err) {
        setError(
          'This password reset link is invalid or has expired. Please request a new one below.',
        )
      }
    },
    [resetPassword, router, token],
  )

  return (
    <React.Fragment>
      <h1 className="mb-4 font-display text-[1.6rem] tracking-[0.28em] uppercase text-[#F4F0E8]">
        Set New Password
      </h1>
      <div className="prose mb-8 text-sm text-[#E5DDCF] dark:prose-invert">
        <p>Please choose a new password for your account.</p>
      </div>
      <form className="max-w-lg space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="space-y-2">
            <FormError message={error} />
            <p className="text-sm text-[#E5DDCF]">
              <Link href="/forgot-password" className="underline underline-offset-4 hover:text-white">
                Request a new reset link
              </Link>
            </p>
          </div>
        )}

        <FormItem>
          <Label htmlFor="password" className="mb-2 text-sm font-medium text-[#FAF2DE]">
            New password
          </Label>
          <div className="flex h-12 items-center justify-between gap-3 rounded-[6px] bg-[rgba(250,242,222,0.16)] px-4">
            <Input
              id="password"
              {...register('password', { required: 'Please provide a new password.' })}
              type="password"
              className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#FAF2DE] placeholder:text-[#FAF2DE]/70 transition-colors hover:bg-[rgba(250,242,222,0.08)] focus-visible:outline-none"
            />
          </div>
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2 text-sm font-medium text-[#FAF2DE]">
            Confirm password
          </Label>
          <div className="flex h-12 items-center justify-between gap-3 rounded-[6px] bg-[rgba(250,242,222,0.16)] px-4">
            <Input
              id="passwordConfirm"
              {...register('passwordConfirm', {
                required: 'Please confirm your new password.',
                validate: (value) => value === watch('password') || 'Passwords do not match.',
              })}
              type="password"
              className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#FAF2DE] placeholder:text-[#FAF2DE]/70 transition-colors hover:bg-[rgba(250,242,222,0.08)] focus-visible:outline-none"
            />
          </div>
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>

        <Button
          type="submit"
          variant="default"
          className="h-12 rounded-full bg-linear-to-b from-[#F8F4EB] to-[#EFE8DA] px-10 text-[13px] font-medium tracking-[0.18em] uppercase text-[#3D3933] shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-white/60 transition-colors focus-visible:ring-2 focus-visible:ring-[#F5F2EC]/60 hover:from-white hover:to-[#F3ECE0]"
        >
          Set password
        </Button>
      </form>
    </React.Fragment>
  )
}
