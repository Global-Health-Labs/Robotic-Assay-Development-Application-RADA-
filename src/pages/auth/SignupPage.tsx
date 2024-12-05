import React from 'react'
import Button from '../../components/ui/Button'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { InputForm } from '../../components/ui/InputForm'
import FormHeader from '../../components/ui/FormHeader'
import { registerRequest } from '../../api/auth.api'
import { signupSchema } from '../../schemas/auth.schema'
import { EmailIcon, PasswordIcon, UserIcon } from '../../components/ui/icons'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

interface SignupFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordConditions {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  specialChar: boolean;
  number: boolean;
  noSpaces: boolean;
}

interface RegisterResponse {
  data: {
    access_token: string;
  };
}

interface RegisterError {
  error: string;
  message: string;
}

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<SignupFormInputs>({
    resolver: yupResolver(signupSchema),
    mode: 'onChange',
    criteriaMode: 'all',
  })

  const navigate = useNavigate()

  const password = watch('password')

  const passwordConditions: PasswordConditions = {
    length: Boolean(password && password.length >= 8),
    lowercase: Boolean(password && /[a-z]/.test(password)),
    uppercase: Boolean(password && /[A-Z]/.test(password)),
    specialChar: Boolean(password && /[^a-zA-Z0-9\s]/.test(password)),
    number: Boolean(password && /[0-9]/.test(password)),
    noSpaces: Boolean(password && !/\s/.test(password)),
  }

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    const { fullName, email, password } = data
    try {
      const res = await registerRequest({ fullName, email, password }) as RegisterResponse
      if (res.data.access_token) {
        window.localStorage.setItem('token', res.data.access_token)
        navigate('/email-sent?type=confirmation')
      }
    } catch (error) {
      console.error(error)
      if ((error as Error).message === 'Network Error') {
        toast.error('No internet connection')
      } else if ((error as AxiosError<RegisterError>).response?.data.error === 'UserAlreadyExists') {
        toast.error((error as AxiosError<RegisterError>).response?.data.message)
      }
    }
  }

  return (
    <div className='flex justify-center items-center h-auto min-h-screen'>
      <div className='flex w-[27.375rem] p-7 flex-col items-center gap-5 rounded-lg'>
        <FormHeader
          title='Sign up'
          description="Enter your details and you're ready to go!"
        />
        <form
          className='flex flex-col w-full items-start gap-4'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <InputForm
            type='text'
            label='Full Name'
            placeholder='Full Name'
            {...register('fullName', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                e.target.value = value.trimStart().replace(/\s\s+/g, ' ')
                trigger('fullName')
              },
            })}
            aria-invalid={errors.fullName ? 'true' : 'false'}
            IconComponent={UserIcon}
          />
          <div style={{ height: '18px', marginTop: '-18px' }}>
            {errors.fullName && (
              <div className='text-red-500 text-xs'>
                {errors.fullName.message}
              </div>
            )}
          </div>
          <InputForm
            type='email'
            placeholder='Email'
            {...register('email', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.trim()
                trigger('email')
              },
            })}
            aria-invalid={errors.email ? 'true' : 'false'}
            IconComponent={EmailIcon}
            onBlur={() => trigger('email')}
          />
          <div style={{ height: '18px', marginTop: '-18px' }}>
            {errors.email && (
              <div className='text-red-500 text-xs'>{errors.email.message}</div>
            )}
          </div>
          <InputForm
            type='password'
            placeholder='Password'
            {...register('password', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/\s/g, '')
                trigger('password')
              },
            })}
            aria-invalid={errors.password ? 'true' : 'false'}
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
                {key === 'number' &&
                  'Password must contain at least one number'}
                {key === 'noSpaces' && 'Password must not contain spaces'}
              </div>
            ))}
          </div>
          <InputForm
            type='password'
            placeholder='Confirm Password'
            {...register('confirmPassword', {
              validate: (value: string) =>
                value === password || 'The passwords do not match',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/\s/g, '')
                trigger('confirmPassword')
              },
            })}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            IconComponent={PasswordIcon}
          />
          <div style={{ height: '18px', marginTop: '-18px' }}>
            {errors.confirmPassword && (
              <div className='text-red-500 text-xs'>
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
          <div className='w-full flex justify-center items-center mt-4'>
            <Button color='black' type='submit' disabled={!isValid}>
              Sign up
            </Button>
          </div>
          <div className='w-full text-center mt-4'>
            <span
              style={{
                color: 'zinc-700',
                fontSize: 'small',
                fontWeight: 'normal',
                fontFamily: 'Nunito Sans',
                lineHeight: 'none',
              }}
            >
              Already have an account?{' '}
            </span>
            <a
              href='/login'
              style={{
                color: 'zinc-700',
                fontSize: 'small',
                fontWeight: 'bold',
                fontFamily: 'Nunito Sans',
                lineHeight: 'none',
              }}
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
