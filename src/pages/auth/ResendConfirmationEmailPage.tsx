import React from 'react'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import FormHeader from '../../components/ui/FormHeader'
import { InputForm } from '../../components/ui/InputForm'
import { useForm, SubmitHandler } from 'react-hook-form'
import { UserIcon } from '../../components/ui/icons'
import { resendConfirmEmailRequest } from '../../api/auth.api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

interface ResendConfirmationEmailInputs {
  email: string;
}

interface ResendConfirmationEmailError {
  message: string;
}

const ResendConfirmationEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendConfirmationEmailInputs>()

  const handleBackToSignInClick = () => {
    navigate('/login')
  }

  const handleResendEmailClick: SubmitHandler<ResendConfirmationEmailInputs> = async (data) => {
    const email = data.email
    try {
      await resendConfirmEmailRequest(email)
      navigate('/email-sent?type=resendConfirmationEmail')
    } catch (error) {
      console.error('Error resending confirmation email:', error)
      const axiosError = error as AxiosError<ResendConfirmationEmailError>
      if (axiosError.response?.data.message === 'Email already confirmed') {
        toast.error('Email already confirmed. Please log in.')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }
  }

  return (
    <div className='flex justify-center flex-col items-center h-screen w-screen m-0'>
      <form
        onSubmit={handleSubmit(handleResendEmailClick)}
        className='w-[438px] h-[298px] p-7 rounded-xl flex-col justify-start items-center gap-7 inline-flex'
      >
        <FormHeader
          title='Resend Confirmation Email'
          description='Enter the email address you used to register with so we can resend the confirmation email.'
        />
        <InputForm
          type='email'
          label={'Email'}
          placeholder={'Email'}
          {...register('email', {
            required: 'Email Address is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: 'Invalid email address',
            },
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
          IconComponent={UserIcon}
        />
        {errors.email && (
          <div className='text-red-500'>{errors.email.message}</div>
        )}
        <div className='w-[382px] h-[54px] justify-start items-start gap-3 inline-flex'>
          <Button color='white' onClick={handleBackToSignInClick}>
            Back to sign in
          </Button>
          <Button type='submit'> Resend</Button>
        </div>
      </form>
    </div>
  )
}

export default ResendConfirmationEmailPage
