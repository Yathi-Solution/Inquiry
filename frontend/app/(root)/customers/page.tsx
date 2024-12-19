"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { request } from "graphql-request";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_CUSTOMERS } from "@/graphql/queries";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Customer, FilterCustomersInput } from "@/graphql/queries";

interface CustomersResponse {
  getCustomers: Customer[];
}

export default function CustomersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
      return;
    }
  }, [token, user, router]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token || !user) return;

      try {
        let filters: FilterCustomersInput = {};
        if (user.role_id === 2) {
          filters.location_id = user.location_id;
        } else if (user.role_id === 3) {
          filters.salesperson_id = user.user_id;
        }

        const response = await request<CustomersResponse>(
          process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
          GET_CUSTOMERS,
          { filters },
          {
            Authorization: `Bearer ${token}`,
          }
        );

        setCustomers(response.getCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [token, user]);

  if (!token || !user) return null;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Visit Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  {format(new Date(customer.visit_date), 'PPP')}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    customer.status === 'pending' ? 'default' :
                    customer.status === 'completed' ? 'secondary' :
                    'outline'
                  }>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>{customer.notes || '-'}</TableCell>
                <TableCell>
                  {format(new Date(customer.created_at), 'PPP')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 