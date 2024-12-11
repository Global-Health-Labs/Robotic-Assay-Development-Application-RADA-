import { Button } from '@/components/ui/button';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import EmailSentIcon from './components/EmailSentIcon';

type EmailType = 'resetPassword' | string | null;

const EmailSentPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailType: EmailType = queryParams.get('type');

  const message: string =
    emailType === 'resetPassword'
      ? 'We have sent you a reset password email'
      : 'We have sent a confirmation email so you can start right now';

  return (
    <div className="m-0 flex flex-col items-center gap-6">
      <div className="flex w-full flex-col items-center gap-6 p-3 sm:max-w-md sm:rounded-lg sm:p-7">
        <EmailSentIcon />
        <div className="flex flex-col items-center justify-start gap-4 self-stretch">
          <div className="text-center text-2xl font-bold leading-tight text-neutral-600">
            Email sent
          </div>
          <div className="self-stretch text-center text-base font-normal leading-tight text-black">
            {message}
          </div>
        </div>
        <Link to="/login">
          <Button>Go Back to Sign In</Button>
        </Link>
      </div>
    </div>
  );
};

export default EmailSentPage;
