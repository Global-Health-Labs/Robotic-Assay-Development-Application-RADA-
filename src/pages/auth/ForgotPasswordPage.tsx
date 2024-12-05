import React from 'react'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import FormHeader from '../../components/ui/FormHeader'
import { InputForm } from '../../components/ui/InputForm'
import { useForm, SubmitHandler } from 'react-hook-form'
import { UserIcon } from '../../components/ui/icons'
import { forgotPasswordRequest } from '../../api/auth.api'
import { toast } from 'sonner'

interface ForgotPasswordInputs {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>()

  const handleBackToSignInClick = () => {
    navigate('/login')
  }

  const handleSendInstructionsClick: SubmitHandler<ForgotPasswordInputs> = async (data) => {
    const email = data.email
    try {
      await forgotPasswordRequest(email)
      navigate('/email-sent?type=resetPassword')
    } catch (error) {
      console.error('Error sending reset password instructions:', error)
      toast.error('Error sending reset password instructions')
    }
  }

  return (
    <div className='flex justify-center flex-col items-center h-screen w-screen m-0'>
      <form
        onSubmit={handleSubmit(handleSendInstructionsClick)}
        className='w-[438px] h-[298px] p-7 rounded-xl flex-col justify-start items-center gap-7 inline-flex'
      >
        <FormHeader
          title='Reset your password'
          description='Enter the email address you used to register with so we can send instructions.'
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
          <Button type='submit'> Send instructions</Button>
        </div>
      </form>
    </div>
  )
}

export default ForgotPasswordPage
