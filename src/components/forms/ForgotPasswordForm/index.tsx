'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
}

export const ForgotPasswordForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(async (data: FormData) => {
    const response = await fetch(
      `/api/users/forgot-password`,
      {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    )

    if (response.ok) {
      setSuccess(true)
      setError('')
    } else {
      setError(
        'There was a problem while attempting to send you a password reset email. Please try again.',
      )
    }
  }, [])

  return (
    <Fragment>
      {!success && (
        <React.Fragment>
          <h1 className="mb-4 font-display text-[1.6rem] tracking-[0.28em] uppercase text-[#F4F0E8]">
            Forgot Password
          </h1>
          <div className="prose mb-8 text-sm text-[#E5DDCF] dark:prose-invert">
            <p>
              Please enter your email below. You will receive an email message with instructions on how to
              reset your password.
            </p>
          </div>
          <form className="max-w-lg space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <Message className="mb-8" error={error} />

            <FormItem>
              <Label htmlFor="email" className="mb-2 text-sm font-medium text-[#FAF2DE]">
                Email address
              </Label>
              <div className="flex h-12 items-center justify-between gap-3 rounded-[6px] bg-[rgba(250,242,222,0.16)] px-4">
                <span className="text-sm text-[#FAF2DE] opacity-90">✉️</span>
                <Input
                  id="email"
                  {...register('email', { required: 'Please provide your email.' })}
                  type="email"
                  className="h-full flex-1 border-none bg-transparent p-0 text-sm text-[#FAF2DE] placeholder:text-[#FAF2DE]/70 transition-colors hover:bg-[rgba(250,242,222,0.08)] focus-visible:outline-none"
                />
              </div>
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <Button
              type="submit"
              variant="default"
              className="h-12 rounded-full bg-gradient-to-b from-[#F8F4EB] to-[#EFE8DA] px-10 text-[13px] font-medium tracking-[0.18em] uppercase text-[#3D3933] shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-white/60 transition-colors focus-visible:ring-2 focus-visible:ring-[#F5F2EC]/60 hover:from-white hover:to-[#F3ECE0]"
            >
              Send reset link
            </Button>
          </form>
        </React.Fragment>
      )}
      {success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">Request submitted</h1>
          <div className="prose dark:prose-invert">
            <p>Check your email for a link that will allow you to securely reset your password.</p>
          </div>
        </React.Fragment>
      )}
    </Fragment>
  )
}
