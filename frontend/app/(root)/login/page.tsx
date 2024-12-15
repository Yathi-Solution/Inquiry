"use client"; // This is a Client Component

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form"; // Import FormProvider
import { z } from "zod";
import { loginUser } from '@/api/auth'; // Adjust the path as necessary
import { useAuth } from '@/context/AuthContext'; // Adjust the path as necessary
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"; // Adjust the path as necessary
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Adjust the path as necessary
import { Input } from "@/components/ui/input"; // Adjust the path as necessary
import { useEffect } from 'react';

// Define the Zod schema for login
const formSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, formState: { errors } } = methods;
  const router = useRouter();
  const { login, token } = useAuth();

  useEffect(() => {
    if (!token) {
      console.log("No auth token available");
      // Handle unauthorized state (e.g., redirect to login)
    }
  }, [token]);

  const onSubmit = async (data: any) => {
    try {
      const userData = await loginUser(data.email, data.password);
      login(userData); // Update context with user data
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={methods.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your email" />
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
                <Input {...field} type="password" placeholder="Enter your password" />
              </FormControl>
              <FormDescription>Your password</FormDescription>
              <FormMessage>{errors.password ? (errors.password.message as string) : null}</FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit">Login</Button>
      </form>
    </FormProvider>
  );
};

export default Login;
