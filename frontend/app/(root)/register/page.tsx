"use client";

import React, { useState, useEffect } from 'react';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useLocations } from '@/hooks/useLocations';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay"

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role_id: z.number({ required_error: 'Role is required' }),
  location_id: z.number({ required_error: 'Location is required' }),
});

// Define the form type
type FormValues = z.infer<typeof formSchema>;

// Add these interfaces
interface Role {
  role_id: number;
  role_name: string;
}

interface Location {
  location_id: number;
  location_name: string;
}

export default function Register() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  const [mounted, setMounted] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update the selected index when the slide changes
  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      };
      
      emblaApi.on('select', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  }, [emblaApi]);

  const slides = [
    {
      image: '/c1.png',
      quote: "This platform has transformed how we manage our business operations.",
      author: "Sofia Davis",
      role: "CEO"
    },
    {
      image: '/c2.jpg',
      quote: "Streamlined our entire workflow and improved productivity.",
      author: "John Smith",
      role: "Operations Manager"
    },
    {
      image: '/c4.jpg',
      quote: "The best management solution we've ever implemented.",
      author: "Emma Wilson",
      role: "Location Manager"
    }
  ];

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role_id: undefined,
      location_id: undefined,
    },
  });

  // Reset form when component mounts and when user changes
  React.useEffect(() => {
    if (mounted) {
      form.reset({
        name: '',
        email: '',
        password: '',
        role_id: undefined,
        location_id: undefined,
      });
      setError(null);
    }
  }, [form, user, mounted]);

  // Check for authentication before form render
  React.useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
      return;
    }
    
    if (mounted && !user?.name?.includes('SuperAdmin')) {
      router.push('/dashboard');
    }
  }, [user, router, mounted]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show access denied message
  if (!user.name?.includes('SuperAdmin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Access Denied. Only Super Admins can register new users.</p>
      </div>
    );
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role_id: data.role_id,
        location_id: data.location_id
      });

      console.log('Registration successful:', result);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 md:p-8">
      <div className="flex min-h-[calc(100vh-4rem)] rounded-xl overflow-hidden shadow-2xl">
        {/* Left side with carousel - exactly half */}
        <div className="relative w-1/2 hidden lg:block bg-zinc-900 rounded-l-xl">
          <Carousel 
            ref={emblaRef}
            className="w-full h-full" 
            opts={{ 
              loop: true,
              align: "start"
            }}
            plugins={[
              Autoplay({
                delay: 2000,
                stopOnInteraction: false
              })
            ]}
          >
            <CarouselContent className="-ml-0">
              {slides.map((item, index) => (
                <CarouselItem key={index} className="pl-0 h-[calc(100vh-2rem)]">
                  <div className="relative w-full h-full">
                    <img
                      src={item.image}
                      alt={`Slide ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ margin: 0 }}
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-zinc-900/70" />
                    
                    {/* Content for each slide */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-between p-12">
                      <div className="flex items-center text-lg font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-6 w-6 text-white"
                        >
                          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                        <span className="text-white">Your Company Name</span>
                      </div>
                      
                      <div className="space-y-4">
                        <blockquote className="space-y-2">
                          <p className="text-lg text-white">
                            &ldquo;{item.quote}&rdquo;
                          </p>
                          <footer className="text-sm">
                            <p className="text-white font-medium">{item.author}</p>
                            <p className="text-gray-300">{item.role}</p>
                          </footer>
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    selectedIndex === index 
                      ? "bg-white scale-100" 
                      : "bg-white/50 scale-75 hover:scale-100"
                  }`}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* Right side with form - exactly half */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white dark:bg-gray-900 rounded-r-xl">
          <div className="mx-auto w-full max-w-[440px] space-y-6 p-8">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Register New User
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new user account with appropriate permissions
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/15 text-destructive px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter name" 
                          className="mt-1"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Enter the user's full name
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email"
                          className="mt-1" 
                          autoComplete="off"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Enter a valid email address
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter password"
                          className="mt-1" 
                          autoComplete="new-password"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Password must be at least 6 characters
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Role Field */}
                <FormField
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Role</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Admin</SelectItem>
                          <SelectItem value="2">Location Manager</SelectItem>
                          <SelectItem value="3">Salesperson</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-gray-500">
                        Select the user's role
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Location Field */}
                <FormField
                  control={form.control}
                  name="location_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Location</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                        disabled={isLoadingLocations}
                      >
                        <FormControl>
                          <SelectTrigger className="mt-1">
                            <SelectValue 
                              placeholder={isLoadingLocations ? "Loading locations..." : "Select a location"} 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location: Location) => (
                            <SelectItem 
                              key={location.location_id} 
                              value={location.location_id.toString()}
                            >
                              {location.location_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-gray-500">
                        Select the user's location
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || isLoadingLocations}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Registering...
                    </>
                  ) : (
                    'Register User'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
