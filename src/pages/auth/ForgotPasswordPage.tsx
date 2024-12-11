import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { forgotPasswordRequest } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import RADALogoInverted from '@/components/ui/RADALogoInverted';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    try {
      await forgotPasswordRequest(data.email);
      navigate('/email-sent?type=resetPassword');
    } catch (error) {
      console.error('Error sending reset password instructions:', error);
      toast.error('Error sending reset password instructions');
    }
  };

  return (
    <div className="m-0 flex flex-col items-center gap-6">
      <RADALogoInverted />
      <div className="flex w-full flex-col items-center gap-6 p-3 sm:max-w-md sm:rounded-lg sm:border sm:p-7 sm:shadow-md">
        <div className="flex flex-col items-start gap-1 self-stretch">
          <h3 className="text-left text-2xl font-bold leading-tight text-neutral-600">
            Reset your password
          </h3>
          <h6 className="text-sm leading-tight text-muted-foreground">
            Enter your registered email address. You will receive instructions by email to reset the
            password.
          </h6>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your email..." type="email" {...field} />
                      <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Link to="/login" className="flex-1">
                <Button type="button" variant="outline">
                  Back to Login
                </Button>
              </Link>

              <Button type="submit" className="flex-1">
                Send Instructions
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
