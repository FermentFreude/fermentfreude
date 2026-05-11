'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import type { SupportedLocale } from '@/utilities/getLocale'
import { Eye, EyeOff, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  marketingConsent: boolean
}

type CreateAccountFormCopy = {
  firstNameLabel: string
  firstNamePlaceholder: string
  firstNameRequired: string
  lastNameLabel: string
  lastNamePlaceholder: string
  lastNameRequired: string
  emailLabel: string
  emailPlaceholder: string
  emailRequired: string
  passwordLabel: string
  passwordPlaceholder: string
  passwordRequired: string
  passwordMinLength: string
  showPassword: string
  hidePassword: string
  passwordHint: string
  loginLink: string
  marketingConsent: string
  privacyPolicy: string
  submit: string
  processing: string
  successMessage: string
  createError: string
  accountExistsError: string
  credentialsError: string
}

const createAccountFormCopy: Record<SupportedLocale, CreateAccountFormCopy> = {
  de: {
    firstNameLabel: 'Vorname',
    firstNamePlaceholder: 'Vorname',
    firstNameRequired: 'Bitte gib deinen Vornamen ein.',
    lastNameLabel: 'Nachname',
    lastNamePlaceholder: 'Nachname',
    lastNameRequired: 'Bitte gib deinen Nachnamen ein.',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'deine@email.at',
    emailRequired: 'Bitte gib deine E-Mail-Adresse ein.',
    passwordLabel: 'Passwort',
    passwordPlaceholder: 'Dein Passwort',
    passwordRequired: 'Bitte gib ein Passwort ein.',
    passwordMinLength: 'Bitte verwende mindestens 8 Zeichen.',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort verbergen',
    passwordHint: '*Erstelle ein starkes Passwort',
    loginLink: 'Hier anmelden',
    marketingConsent: 'Ich möchte Neuigkeiten, Angebote und Updates per E-Mail erhalten.',
    privacyPolicy: 'Datenschutzerklärung',
    submit: 'Konto erstellen',
    processing: 'Wird erstellt …',
    successMessage: 'Konto erfolgreich erstellt',
    createError: 'Beim Erstellen des Kontos ist ein Fehler aufgetreten.',
    accountExistsError: 'Für diese E-Mail-Adresse gibt es bereits ein Konto. Bitte melde dich an.',
    credentialsError:
      'Das Konto wurde erstellt, aber die automatische Anmeldung ist fehlgeschlagen. Bitte melde dich an.',
  },
  en: {
    firstNameLabel: 'First name',
    firstNamePlaceholder: 'First name',
    firstNameRequired: 'First name is required.',
    lastNameLabel: 'Last name',
    lastNamePlaceholder: 'Last name',
    lastNameRequired: 'Last name is required.',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    emailRequired: 'Email is required.',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Type your password here',
    passwordRequired: 'Password is required.',
    passwordMinLength: 'Please use at least 8 characters.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    passwordHint: '*Create a strong password',
    loginLink: 'Log in here',
    marketingConsent: 'I agree to receive news, offers, and updates by email.',
    privacyPolicy: 'Privacy Policy',
    submit: 'Register account',
    processing: 'Processing',
    successMessage: 'Account created successfully',
    createError: 'There was an error creating the account.',
    accountExistsError: 'An account with this email already exists. Please log in.',
    credentialsError:
      'The account was created, but automatic login failed. Please log in.',
  },
}

const getResponseMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as {
      error?: string
      message?: string
      errors?: Array<{ message?: string }>
    }

    return data.errors?.[0]?.message || data.message || data.error
  } catch {
    return undefined
  }
}

const resolveCreateAccountError = (message: string | undefined, copy: CreateAccountFormCopy) => {
  const normalized = message?.toLowerCase() ?? ''

  if (
    normalized.includes('already') ||
    normalized.includes('duplicate') ||
    normalized.includes('exists') ||
    normalized.includes('unique')
  ) {
    return copy.accountExistsError
  }

  if (normalized.includes('password')) return copy.passwordMinLength

  return copy.createError
}

export type CreateAccountFormProps = {
  locale?: SupportedLocale
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({ locale = 'de' }) => {
  const copy = useMemo(() => createAccountFormCopy[locale], [locale])
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
      setError(null)
      setLoading(true)

      const body = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || undefined,
        marketingConsent: data.marketingConsent ?? false,
      }

      let response: Response

      try {
        response = await fetch(`/api/users`, {
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })
      } catch {
        setError(copy.createError)
        setLoading(false)
        return
      }

      if (!response.ok) {
        const message = await getResponseMessage(response)
        setError(resolveCreateAccountError(message, copy))
        setLoading(false)
        return
      }

      const redirectTo = searchParams.get('redirect')

      try {
        await login({ email: body.email, password: data.password })
        if (redirectTo) router.push(redirectTo)
        else router.push(`/account?success=${encodeURIComponent(copy.successMessage)}`)
      } catch (_) {
        setError(copy.credentialsError)
      } finally {
        setLoading(false)
      }
    },
    [copy, login, router, searchParams],
  )

  const inputWrap = 'flex h-11 items-center gap-2 rounded-xl bg-white/90 px-3'
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
              {copy.firstNameLabel}
            </Label>
            <div className={inputWrap}>
              <User className="w-4 h-4 text-[#3D3933]/50 shrink-0" />
              <input
                id="firstName"
                type="text"
                placeholder={copy.firstNamePlaceholder}
                className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
                {...register('firstName', { required: copy.firstNameRequired })}
              />
            </div>
            {errors.firstName && <FormError message={errors.firstName.message} />}
          </FormItem>
          <FormItem>
            <Label className="sr-only" htmlFor="lastName">
              {copy.lastNameLabel}
            </Label>
            <div className={inputWrap}>
              <User className="w-4 h-4 text-[#3D3933]/50 shrink-0" />
              <input
                id="lastName"
                type="text"
                placeholder={copy.lastNamePlaceholder}
                className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
                {...register('lastName', { required: copy.lastNameRequired })}
              />
            </div>
            {errors.lastName && <FormError message={errors.lastName.message} />}
          </FormItem>
        </div>

        <FormItem>
          <Label className="sr-only" htmlFor="email">
            {copy.emailLabel}
          </Label>
          <div className={inputWrap}>
            <Mail className="w-4 h-4 text-[#3D3933]/50 shrink-0" />
            <input
              id="create-email"
              type="email"
              placeholder={copy.emailPlaceholder}
              className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
              {...register('email', { required: copy.emailRequired })}
            />
          </div>
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label className="sr-only" htmlFor="password">
            {copy.passwordLabel}
          </Label>
          <div className={inputWrap}>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[#3D3933]/50 hover:text-[#3D3933] transition-colors cursor-pointer shrink-0"
              aria-label={showPassword ? copy.hidePassword : copy.showPassword}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <input
              id="create-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={copy.passwordPlaceholder}
              className="h-full flex-1 border-none bg-transparent px-1 py-0 text-[13px] font-sans text-[#3D3933] placeholder:text-[#3D3933]/50 outline-none"
              {...register('password', {
                minLength: { value: 8, message: copy.passwordMinLength },
                required: copy.passwordRequired,
              })}
            />
          </div>
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="flex items-center justify-between gap-4 pt-0.5 text-[12px] font-sans text-[#E5DDCF]">
          <span>{copy.passwordHint}</span>
          <Link
            href={`/login${allParams}`}
            className="underline underline-offset-4 text-[#FAF2DE] hover:text-white"
          >
            {copy.loginLink}
          </Link>
        </div>

        <div className="flex items-start gap-3 pt-1 text-[#E5DDCF]">
          <input
            id="marketingConsent"
            type="checkbox"
            className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[#e6be68]"
            {...register('marketingConsent')}
          />
          <Label
            htmlFor="marketingConsent"
            className="cursor-pointer text-[12px] leading-relaxed font-sans"
          >
            {copy.marketingConsent}{' '}
            <Link href="/datenschutz" className="underline underline-offset-4 hover:text-white">
              {copy.privacyPolicy}
            </Link>
          </Label>
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
          {loading ? copy.processing : copy.submit}
        </Button>
      </div>
    </form>
  )
}
