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
import { GET_CUSTOMERS, GET_ALL_USERS, UPDATE_CUSTOMER, GET_ALL_LOCATIONS, GET_SALESPEOPLE_BY_LOCATION } from "@/graphql/queries";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Customer, FilterCustomersInput, User, Location } from "@/graphql/queries";
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
  visit_date: Date | string;
  status: string;
  notes?: string;
  created_at: Date | string;
  salesperson_id: number | null;
  location_id: number;
}

interface LocationsResponse {
  locations: {
    location_id: number;
    location_name: string;
  }[];
}

interface EditCustomerFieldsProps {
  editingCustomer: CustomerDetails;
  setEditingCustomer: React.Dispatch<React.SetStateAction<CustomerDetails | null>>;
  user: User;
  locations: Location[];
  salespeople: Salesperson[];
  selectedLocation: number | null;
  setSelectedLocation: (id: number) => void;
}

interface SalespeopleResponse {
  getSalespeopleByLocation: {
    user_id: number;
    name: string;
    role_id: number;
    location_id: number;
  }[];
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
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

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

      if (user.roles?.role_name.toLowerCase() === 'super-admin') {
        const locationsResponse = await request<LocationsResponse>(
          process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
          GET_ALL_LOCATIONS,
          {},
          {
            Authorization: `Bearer ${token}`,
          }
        );
        setLocations(locationsResponse.locations);
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

  const getSalespersonName = (salesperson_id: number | null) => {
    if (!salesperson_id) return '-';
    const salesperson = salespeople.find(sp => sp.user_id === salesperson_id);
    return salesperson?.name || '-';
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer || !token) return;
    
    try {
      await request(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
        UPDATE_CUSTOMER,
        {
          customerId: editingCustomer.customer_id,
          updateData: {
            name: editingCustomer.name,
            email: editingCustomer.email,
            phone: editingCustomer.phone,
            visit_date: format(new Date(editingCustomer.visit_date), 'yyyy-MM-dd HH:mm:ss.SSS'),
            status: editingCustomer.status,
            notes: editingCustomer.notes,
            location_id: editingCustomer.location_id,
            salesperson_id: editingCustomer.salesperson_id
          }
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      await fetchData();
      setIsEditing(false);
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error("Failed to update customer");
    }
  };

  const EditCustomerFields = ({ 
    editingCustomer, 
    setEditingCustomer, 
    user,
    locations,
    salespeople,
    selectedLocation,
    setSelectedLocation 
  }: EditCustomerFieldsProps) => {
    const [availableSalespeople, setAvailableSalespeople] = useState<Salesperson[]>([]);

    useEffect(() => {
      const fetchSalespeopleForLocation = async () => {
        if (!selectedLocation || !token) return;
        
        try {
          const filteredSalespeople = salespeople.filter(
            sp => sp.location_id === selectedLocation && sp.role_id === 3
          );
          setAvailableSalespeople(filteredSalespeople);
        } catch (error) {
          console.error('Error filtering salespeople:', error);
        }
      };

      if (user.roles?.role_name.toLowerCase() === 'super-admin' && selectedLocation) {
        fetchSalespeopleForLocation();
      }
    }, [selectedLocation, salespeople]);

    const commonFields = (
      <>
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
      </>
    );

    const renderRoleSpecificFields = () => {
      switch (user.roles?.role_name.toLowerCase()) {
        case 'super-admin':
          return (
            <>
              <div className="space-y-2">
                <label>Location</label>
                <Select
                  value={selectedLocation?.toString()}
                  onValueChange={(value) => {
                    const locationId = parseInt(value);
                    setSelectedLocation(locationId);
                    setEditingCustomer(prev => prev ? {
                      ...prev,
                      location_id: locationId,
                      salesperson_id: null
                    } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem 
                        key={loc.location_id} 
                        value={loc.location_id.toString()}
                      >
                        {loc.location_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedLocation && availableSalespeople.length > 0 && (
                <div className="space-y-2">
                  <label>Salesperson</label>
                  <Select
                    value={editingCustomer.salesperson_id?.toString()}
                    onValueChange={(value) => 
                      setEditingCustomer(prev => prev ? {
                        ...prev,
                        salesperson_id: parseInt(value)
                      } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select salesperson" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSalespeople.map((sp) => (
                        <SelectItem 
                          key={sp.user_id} 
                          value={sp.user_id.toString()}
                        >
                          {sp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          );

        case 'location-manager':
          return (
            <div className="space-y-2">
              <label>Salesperson</label>
              <Select
                value={editingCustomer.salesperson_id?.toString()}
                onValueChange={(value) => 
                  setEditingCustomer(prev => prev ? {
                    ...prev,
                    salesperson_id: parseInt(value)
                  } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salesperson" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople
                    .filter(sp => sp.location_id === user.location_id)
                    .map((sp) => (
                      <SelectItem 
                        key={sp.user_id} 
                        value={sp.user_id.toString()}
                      >
                        {sp.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          );

        case 'salesperson':
          return null; // Salesperson can't change location or salesperson

        default:
          return null;
      }
    };

    return (
      <div className="space-y-4">
        {commonFields}
        {renderRoleSpecificFields()}
      </div>
    );
  };

  if (!token || !user) return null;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Customers</h1>
        <Button 
          onClick={() => router.push('/customers/create')}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Phone</TableHead>
              <TableHead className="min-w-[120px]">Visit Date</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              {user?.role_id !== 3 && (
                <TableHead className="min-w-[150px]">Salesperson</TableHead>
              )}
              <TableHead className="w-[50px]">Actions</TableHead>
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
                    <DrawerContent className="bg-background p-4 sm:p-6">
                      <DrawerHeader className="pb-4">
                        <DrawerTitle className="text-lg sm:text-xl">Customer Details</DrawerTitle>
                      </DrawerHeader>
                      {selectedCustomer && (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">Notes</h3>
                            <p className="mt-1 text-sm sm:text-base">{selectedCustomer.notes || 'No notes available'}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">Created At</h3>
                            <p className="mt-1 text-sm sm:text-base">
                              {format(new Date(selectedCustomer.created_at), 'PPP')}
                            </p>
                          </div>
                          {user?.role_id !== 3 && (
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base">Salesperson</h3>
                              <p className="mt-1 text-sm sm:text-base">
                                {getSalespersonName(selectedCustomer.salesperson_id)}
                              </p>
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
                    customer.status === 'ongoing' ? 'primary' :
                    customer.status === 'completed' ? 'secondary' :
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

      {/* Edit Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-lg sm:text-xl">Edit Customer</SheetTitle>
          </SheetHeader>
          {editingCustomer && (
            <div className="mt-4 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto pr-4">
              <EditCustomerFields 
                editingCustomer={editingCustomer}
                setEditingCustomer={setEditingCustomer}
                user={user}
                locations={locations}
                salespeople={salespeople}
                selectedLocation={editingCustomer.location_id}
                setSelectedLocation={(id) => 
                  setEditingCustomer(prev => prev ? {
                    ...prev,
                    location_id: id
                  } : null)
                }
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingCustomer(null);
                    setIsEditing(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateCustomer}
                  className="w-full sm:w-auto"
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