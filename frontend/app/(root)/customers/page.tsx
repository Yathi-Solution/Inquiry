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
import { GET_CUSTOMERS, GET_ALL_USERS, UPDATE_CUSTOMER } from "@/graphql/queries";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Customer, FilterCustomersInput } from "@/graphql/queries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerOverlay,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CustomersResponse {
  getCustomers: Customer[];
}

interface Salesperson {
  user_id: number;
  name: string;
  location_id: number;
  role_id: number;
}

interface UsersResponse {
  users: Salesperson[];
}

interface CustomerDetails {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  visit_date: Date;
  status: string;
  notes?: string;
  created_at: Date;
  salesperson_id: number;
  location_id: number;
}

export default function CustomersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDetails | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!savedToken && !token) {
      router.push('/login');
      return;
    }
    if (!user && savedUser) {
      // The user data will be restored by AuthContext
      return;
    }
  }, [token, user, router]);

  const fetchData = async () => {
    if (!token || !user) return;

    try {
      let filters: FilterCustomersInput = {};
      if (user.role_id === 2) {
        filters.location_id = user.location_id;
      } else if (user.role_id === 3) {
        filters.salesperson_id = user.user_id;
      }

      const customersResponse = await request<CustomersResponse>(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
        GET_CUSTOMERS,
        { filters },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (user.role_id !== 3) {
        const usersResponse = await request<UsersResponse>(
          process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
          GET_ALL_USERS,
          {},
          {
            Authorization: `Bearer ${token}`,
          }
        );
        const salespeopleList = usersResponse.users.filter(user => user.role_id === 3);
        setSalespeople(salespeopleList);
      }

      setCustomers(customersResponse.getCustomers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, user]);

  const getSalespersonName = (salesperson_id: number) => {
    const salesperson = salespeople.find(sp => sp.user_id === salesperson_id);
    return salesperson?.name || '-';
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer || !token) return;
    
    try {
      const formattedInput = {
        ...editingCustomer,
        visit_date: format(new Date(editingCustomer.visit_date), 'yyyy-MM-dd HH:mm:ss.SSS'),
      };

      await request(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
        UPDATE_CUSTOMER,
        {
          updateCustomerInput: formattedInput
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      toast.success("Customer updated successfully");
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error("Failed to update customer");
    }
  };

  if (!token || !user) return null;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button 
          onClick={() => router.push('/customers/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
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
              {user?.role_id !== 3 && (
                <TableHead>Salesperson</TableHead>
              )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell>
                  <Drawer 
                    open={!!selectedCustomer} 
                    onOpenChange={(open) => !open && setSelectedCustomer(null)}
                  >
                    <DrawerTrigger asChild>
                      <button
                        className="hover:underline text-left w-full"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        {customer.name}
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-background">
                      <DrawerHeader>
                        <DrawerTitle>Customer Details</DrawerTitle>
                      </DrawerHeader>
                      {selectedCustomer && (
                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="font-semibold">Notes</h3>
                            <p className="mt-1">{selectedCustomer.notes || 'No notes available'}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold">Created At</h3>
                            <p className="mt-1">{format(new Date(selectedCustomer.created_at), 'PPP')}</p>
                          </div>
                          {user?.role_id !== 3 && (
                            <div>
                              <h3 className="font-semibold">Salesperson</h3>
                              <p className="mt-1">{getSalespersonName(selectedCustomer.salesperson_id)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DrawerContent>
                  </Drawer>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  {format(new Date(customer.visit_date), 'PPP')}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    customer.status === 'pending' ? 'default' :
                    customer.status === 'completed' ? 'secondary' :
                    customer.status === 'ongoing' ? 'primary' :
                    customer.status === 'cancelled' ? 'destructive' :
                    'outline'
                  }>
                    {customer.status}
                  </Badge>
                </TableCell>
                {user?.role_id !== 3 && (
                  <TableCell>
                    {getSalespersonName(customer.salesperson_id)}
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCustomer(customer);
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Customer Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
          </SheetHeader>
          {editingCustomer && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label>Name</label>
                <Input
                  value={editingCustomer.name}
                  onChange={(e) => 
                    setEditingCustomer(prev => prev ? {
                      ...prev,
                      name: e.target.value
                    } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Email</label>
                <Input
                  value={editingCustomer.email}
                  onChange={(e) => 
                    setEditingCustomer(prev => prev ? {
                      ...prev,
                      email: e.target.value
                    } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Phone</label>
                <Input
                  value={editingCustomer.phone}
                  onChange={(e) => 
                    setEditingCustomer(prev => prev ? {
                      ...prev,
                      phone: e.target.value
                    } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Visit Date</label>
                <Input
                  type="date"
                  value={format(new Date(editingCustomer.visit_date), 'yyyy-MM-dd')}
                  onChange={(e) => 
                    setEditingCustomer(prev => prev ? {
                      ...prev,
                      visit_date: new Date(e.target.value)
                    } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Status</label>
                <Select
                  value={editingCustomer.status}
                  onValueChange={(value) => 
                    setEditingCustomer(prev => prev ? {
                      ...prev,
                      status: value
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Notes</label>
                <Textarea
                  value={editingCustomer.notes}
                  onChange={(e) => 
                    setEditingCustomer(prev => prev ? {
                      ...prev,
                      notes: e.target.value
                    } : null)
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingCustomer(null);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateCustomer}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
} 