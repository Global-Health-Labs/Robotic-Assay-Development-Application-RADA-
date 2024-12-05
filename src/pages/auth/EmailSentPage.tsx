import React from 'react'
import EmailSentIcon from '../../components/ui/icons/EmailSentIcon'
import Button from '../../components/ui/Button'
import { useLocation, useNavigate } from 'react-router-dom'

type EmailType = 'resetPassword' | string | null;

const EmailSentPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const emailType: EmailType = queryParams.get('type')

  const message: string =
    emailType === 'resetPassword'
      ? 'We have sent you a reset password email so you can recover your account'
      : 'We have sent a confirmation email so you can start right now'

  const handleClick = async (): Promise<void> => {
    navigate('/login')
  }

  return (
    <div className='flex justify-center flex-col items-center h-screen w-screen m-0'>
      <EmailSentIcon />
      <div className='w-[438px] h-[214px] p-7 rounded-xl flex-col justify-start items-center gap-7 inline-flex'>
        <div className='self-stretch h-[76px] flex-col justify-start items-center gap-4 flex'>
          <div className="text-center text-neutral-600 text-2xl font-bold font-['Nunito Sans'] leading-tight">
            Email sent
          </div>
          <div className="self-stretch text-black text-base font-normal font-['Nunito Sans'] leading-tight">
            {message}
          </div>
        </div>
        <div className='self-stretch h-[54px] px-4 py-[15px] bg-neutral-900 rounded-lg justify-between items-center inline-flex'>
          <Button
            className="text-center text-white text-lg font-bold font-['Nunito Sans'] leading-normal"
            onClick={handleClick}
          >
            Go back to sign in
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmailSentPage
