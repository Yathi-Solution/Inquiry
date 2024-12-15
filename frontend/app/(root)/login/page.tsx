"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { loginUser } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, formState: { errors }, reset } = methods;
  const router = useRouter();
  const { login } = useAuth();

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await loginUser(data.email, data.password);
      login(userData);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
      // Clear password field on error
      reset({ 
        ...data, 
        password: "" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <FormField
          control={methods.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter your email" 
                  type="email"
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>Your email address</FormDescription>
              <FormMessage>{errors.email ? (errors.email.message as string) : null}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  placeholder="Enter your password"
                  autoComplete="new-password"
                />
              </FormControl>
              <FormDescription>Your password</FormDescription>
              <FormMessage>{errors.password ? (errors.password.message as string) : null}</FormMessage>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default Login;
