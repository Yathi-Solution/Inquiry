"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { request } from "graphql-request";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CREATE_CUSTOMER, GET_ALL_USERS } from "@/graphql/queries";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  visit_date: z.string(),
  notes: z.string().optional(),
  salesperson_id: z.string(),
  location_id: z.string(),
});

interface SalespeopleResponse {
  users: {
    user_id: number;
    name: string;
    location_id: number;
    roles: {
      role_id: number;
      role_name: string;
    };
  }[];
}

interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  visit_date: string;
  notes?: string;
  salesperson_id: number;
  location_id: number;
}

interface CreateCustomerResponse {
  createCustomer: {
    customer_id: number;
    name: string;
    email: string;
    phone: string;
    visit_date: string;
    notes?: string;
    status: string;
    location_id: number;
    salesperson_id: number;
  }
}

interface Salesperson {
  user_id: number;
  name: string;
  location_id: number;
}

export default function CustomerForm() {
  const { user, token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modified salespeople query
  const { data: salespeople } = useQuery<SalespeopleResponse['users']>({
    queryKey: ['salespeople'],
    queryFn: async () => {
      const response = await request<SalespeopleResponse>(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
        GET_ALL_USERS,
        {},
        { Authorization: `Bearer ${token}` }
      );
      
      // Filter to only show salespeople (role_id === 3)
      const salespeople = response.users.filter(user => user.roles?.role_id === 3);
      
      // For location managers, further filter by location
      if (user?.role_id === 2) {
        return salespeople.filter(sp => sp.location_id === user.location_id);
      }
      
      return salespeople;
    },
    enabled: !!token && user?.role_id !== 3,
  });

  console.log('Filtered salespeople:', salespeople);
  console.log('User role:', user?.role_id);

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      visit_date: new Date().toISOString().split('T')[0],
      notes: "",
      salesperson_id: user?.role_id === 3 ? user.user_id.toString() : "",
      location_id: user?.location_id?.toString() || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof customerSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      const customerInput: CustomerInput = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        visit_date: new Date(values.visit_date).toISOString(),
        notes: values.notes,
        salesperson_id: parseInt(values.salesperson_id),
        location_id: parseInt(values.location_id)
      };

      const response = await request<CreateCustomerResponse>(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
        CREATE_CUSTOMER,
        {
          createCustomerInput: customerInput
        },
        { Authorization: `Bearer ${token}` }
      );

      if (response.createCustomer) {
        form.reset();
        // Show success message or redirect
      }
    } catch (error: any) {
      console.error("Customer creation error:", error);
      setError(error.response?.errors?.[0]?.message || "An error occurred while creating the customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Customer</h2>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Customer name" />
                </FormControl>
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
                  <Input {...field} type="email" placeholder="customer@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visit_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {user?.role_id !== 3 && (
            <FormField
              control={form.control}
              name="salesperson_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Salesperson</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a salesperson" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {salespeople?.map((sp: any) => (
                        <SelectItem key={sp.user_id} value={sp.user_id.toString()}>
                          {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Additional notes..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Customer"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 