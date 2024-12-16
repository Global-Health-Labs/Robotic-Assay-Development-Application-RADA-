import { loginRequest } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import RADALogoInverted from '@/components/ui/RADALogoInverted';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Lock, User } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const SigninPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth();

  // Initialize form with Zod validation
  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const res = await loginRequest(data);

      // Handle unconfirmed users
      if (!res.data.user.confirmed) {
        // Clear any existing token
        window.localStorage.removeItem('token');
        // Redirect to reset password page with the token
        navigate(`/reset-password?token=${res.data.access_token}`, { replace: true });
      } else {
        if (res.data.access_token) {
          window.localStorage.setItem('token', res.data.access_token);
          await fetchUserProfile();
          navigate('/experiments');
        }
      }
    } catch (error: any) {
      console.error(error);

      if ((error as Error).message === 'Network Error') {
        toast.error('Network error. Please try again later.');
        return;
      }

      if ((error as AxiosError<string>).response?.data === 'Invalid email or password') {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="m-0 flex flex-col items-center gap-6">
      <RADALogoInverted />
      <div className="flex w-full flex-col items-center gap-6 p-3 sm:max-w-md sm:rounded-lg sm:border sm:p-7 sm:shadow-md">
        <div className="flex flex-col items-start gap-1 self-stretch">
          <div className="text-left text-2xl font-bold leading-tight text-neutral-600">
            Welcome back!
          </div>
          <div className="text-sm leading-none text-muted-foreground">
            Please sign in to continue
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-start gap-6 self-stretch"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Email"
                      type="email"
                      icon={<User className="h-4 w-4" />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      icon={<Lock className="h-4 w-4" />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Sign In
            </Button>

            <div className="flex w-full justify-center text-xs font-bold leading-none">
              <a href="/forgot-password" className="text-zinc-700 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SigninPage;
