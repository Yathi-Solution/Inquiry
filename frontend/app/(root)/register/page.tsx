"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/api/auth';
import { useRouter } from 'next/navigation';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Define the form type
type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Check for authentication before form render
  React.useEffect(() => {
    if (!user || !user.name?.includes('SuperAdmin')) {
      router.push('/dashboard'); // Redirect non-admin users
    }
  }, [user, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await registerUser({
        ...data,
        role_id: 2,
        location_id: 1
      });

      // Show success message or toast here if needed
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (typeof window !== 'undefined' && !user) {
    return <div>Loading...</div>;
  }

  // Show access denied message
  if (!user?.name?.includes('SuperAdmin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Access Denied. Only Super Admins can register new users.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Register New User</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create a new user account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the user's full name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormDescription>Enter a valid email address</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormDescription>Password must be at least 6 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register User'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
