import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { InputForm } from '../../components/ui/InputForm'
import FormHeader from '../../components/ui/FormHeader'
import { PasswordIcon } from '../../components/ui/icons'
import { resetPasswordRequest } from '../../api/auth.api'
import { changePasswordSchema } from '../../schemas/auth.schema'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'sonner'

interface PasswordFormInputs {
  newPassword: string;
  confirmNewPassword: string;
}

interface PasswordConditions {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  specialChar: boolean;
  noSpaces: boolean;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const token = query.get('token')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<PasswordFormInputs>({
    resolver: yupResolver(changePasswordSchema),
  })

  const password = watch('newPassword')

  const passwordConditions: PasswordConditions = {
    length: (password?.length ?? 0) >= 8,
    lowercase: /[a-z]/.test(password || ''),
    uppercase: /[A-Z]/.test(password || ''),
    specialChar: /[^a-zA-Z0-9\s]/.test(password || ''),
    noSpaces: !/\s/.test(password || ''),
  }

  const onSubmit: SubmitHandler<PasswordFormInputs> = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast('Passwords do not match')
      return
    }
    try {
      if (!token) {
        toast.error('Reset token is missing')
        return
      }

      const payload: ResetPasswordPayload = {
        token,
        password: data.newPassword,
      }

      const res = await resetPasswordRequest(payload)

      if (res.status === 200) {
        navigate('/login', { replace: true })
        toast(
          'Password successfully changed. Please log in with your new password.'
        )
      }
    } catch (error) {
      console.error(error)
      toast('Failed to change password. Please try again later.')
    }
  }

  return (
    <div className='flex justify-center items-center h-screen w-screen m-0'>
      <div className='flex w-[27.375rem] p-7 flex-col items-center gap-10 rounded-lg'>
        <FormHeader
          title='Change Password'
          description={'Enter your new password below.'}
        />
        <form
          className='flex flex-col items-start gap-10 self-stretch'
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputForm
            type='password'
            placeholder='Password'
            {...register('newPassword', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/\s/g, '')
                trigger('newPassword')
              },
            })}
            aria-invalid={errors.newPassword ? 'true' : 'false'}
            IconComponent={PasswordIcon}
          />
          <div className='text-xs mt-2'>
            {Object.entries(passwordConditions).map(([key, isMet]) => (
              <div
                key={key}
                className={`${
                  isMet ? 'text-green-500' : 'text-black-500'
                } text-xs`}
              >
                {isMet ? '✓' : '•'}
                {key === 'length' &&
                  'Password must be at least 8 characters long'}
                {key === 'lowercase' &&
                  'Password must contain at least one lowercase letter'}
                {key === 'uppercase' &&
                  'Password must contain at least one uppercase letter'}
                {key === 'specialChar' &&
                  'Password must contain at least one special character'}
                {key === 'noSpaces' && 'Password must not contain spaces'}
              </div>
            ))}
          </div>
          <InputForm
            type='password'
            label={'Confirm New Password'}
            placeholder={'Confirm New Password'}
            {...register('confirmNewPassword', {
              validate: (value: string) =>
                value === password || 'The passwords do not match',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/\s/g, '')
                trigger('confirmNewPassword')
              },
            })}
            IconComponent={PasswordIcon}
          />
          {errors.confirmNewPassword && (
            <div className='text-red-500'>
              {errors.confirmNewPassword.message}
            </div>
          )}
          <Button color='black' type='submit' disabled={!isValid}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
