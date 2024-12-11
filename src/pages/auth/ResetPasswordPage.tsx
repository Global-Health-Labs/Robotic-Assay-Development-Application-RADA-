import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPasswordRequest } from '@/api/auth.api';
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
import * as z from 'zod';
import RADALogoInverted from '@/components/ui/RADALogoInverted';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

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

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[^a-zA-Z0-9\s]/, 'Password must contain at least one special character')
      .regex(/^[^\s]+$/, 'Password cannot contain spaces'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const form = useForm<PasswordFormInputs>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!token) {
      toast.error('Reset token is missing');
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const password = form.watch('newPassword');

  const passwordConditions: PasswordConditions = {
    length: (password?.length ?? 0) >= 8,
    lowercase: /[a-z]/.test(password || ''),
    uppercase: /[A-Z]/.test(password || ''),
    specialChar: /[^a-zA-Z0-9\s]/.test(password || ''),
    noSpaces: !/\s/.test(password || ''),
  };

  const onSubmit = async (data: PasswordFormInputs) => {
    try {
      const payload = {
        token: token!,
        password: data.newPassword,
      };

      const res = await resetPasswordRequest(payload);

      if (res.status === 200) {
        navigate('/login', { replace: true });
        toast.success('Password successfully changed');
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || '';
      console.error(error);
      toast.error(`Failed to change password. ${serverMessage}`);
    }
  };

  return (
    <div className="m-0 flex flex-col items-center gap-6">
      <RADALogoInverted />
      <div className="flex w-full flex-col items-center gap-6 p-3 sm:max-w-md sm:rounded-lg sm:border sm:p-7 sm:shadow-md">
        <div className="flex flex-col items-start gap-1 self-stretch">
          <h3 className="text-left text-2xl font-bold leading-tight text-neutral-600">
            Change Password
          </h3>
          <h6 className="text-sm leading-tight text-muted-foreground">Enter your new password.</h6>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      {...field}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/\s/g, '');
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <div className="mt-2 space-y-1 text-xs">
                    {Object.entries(passwordConditions).map(([key, isMet]) => (
                      <div
                        key={key}
                        className={`${
                          isMet ? 'text-green-500' : 'text-gray-500'
                        } flex items-center gap-1`}
                      >
                        <span>{isMet ? '✓' : '•'}</span>
                        <span>
                          {key === 'length' && 'At least 8 characters'}
                          {key === 'lowercase' && 'One lowercase letter'}
                          {key === 'uppercase' && 'One uppercase letter'}
                          {key === 'specialChar' && 'One special character'}
                          {key === 'noSpaces' && 'No spaces'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/\s/g, '');
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="outline" type="button">
                  Back to Sign In
                </Button>
              </Link>
              <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
                Change Password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
