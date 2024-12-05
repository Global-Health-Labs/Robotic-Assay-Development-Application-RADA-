import { loginRequest } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

interface LoginResponse {
  data: {
    access_token: string;
  };
}

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
      const res = (await loginRequest(data)) as LoginResponse;

      if (res.data.access_token) {
        window.localStorage.setItem('token', res.data.access_token);
        await fetchUserProfile();
        navigate('/experiments');
      }
    } catch (error) {
      console.error(error);

      if ((error as Error).message === 'Network Error') {
        toast.error('Network error. Please try again later.');
        return;
      }

      if ((error as AxiosError<string>).response?.data === 'Invalid email or password') {
        toast.error('Invalid email or password');
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="m-0 flex items-center justify-center">
      <div className="flex w-96 flex-col items-center gap-10 rounded-lg p-7">
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
              Sign in
            </Button>

            <div className="w-full text-xs font-bold leading-none">
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
