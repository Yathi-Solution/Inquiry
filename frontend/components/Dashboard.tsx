"use client";

import React, { useState, useRef, useCallback, useContext, useEffect, useMemo, createContext } from "react";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnFiltersState,
  VisibilityState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GET_FILTERED_USERS, UPDATE_USER, GET_ALL_USERS, DELETE_USERS, GET_ALL_LOCATIONS } from "@/graphql/queries";
import debounce from "lodash/debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!;

export type User = {
  user_id: string;
  name: string;
  email: string;
  role_id: string;
  location_id: string;
};

const ActionMenu = ({ user }: { user: User }) => {
  const [updatedUser, setUpdatedUser] = useState(user);
  const queryClient = useQueryClient();
  const closeRef = useRef<HTMLButtonElement>(null);

  const { mutate: updateUser } = useMutation({
    mutationFn: async (variables: any) => {
      return request(
        graphqlEndpoint,
        UPDATE_USER,
        variables
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeRef.current?.click();
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    }
  });

  const handleSave = async () => {
    try {
      const updatePayload = {
        user_id: parseInt(user.user_id),
        name: updatedUser.name || user.name,
        email: updatedUser.email || user.email,
        role_id: parseInt(updatedUser.role_id || user.role_id),
        location_id: parseInt(updatedUser.location_id || user.location_id)
      };
      
      updateUser({ 
        updateUserInput: updatePayload
      });
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">Edit</Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              placeholder="Name"
              defaultValue={user.name}
              onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              placeholder="Email"
              defaultValue={user.email}
              onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role ID
            </label>
            <Input
              id="role"
              type="number"
              placeholder="Role ID"
              defaultValue={user.role_id}
              onChange={(e) => setUpdatedUser({ ...updatedUser, role_id: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location ID
            </label>
            <Input
              id="location"
              type="number"
              placeholder="Location ID"
              defaultValue={user.location_id}
              onChange={(e) => setUpdatedUser({ ...updatedUser, location_id: e.target.value })}
              className="w-full"
            />
          </div>
          <Button onClick={handleSave} className="w-full mt-6">
            Save changes
          </Button>
          <SheetClose ref={closeRef} className="hidden" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: '1', label: 'Super-Admin' },
  { value: '2', label: 'Salesperson' },
  { value: '3', label: 'Location-Manager' },
  { value: 'null', label: 'Customer' },
];

const LocationContext = createContext<Map<string, string>>(new Map());
const RoleContext = React.createContext<{ roleOptions: typeof roleOptions }>({ roleOptions });

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role_id",
    header: "Role",
    cell: ({ row }) => {
      const roleId = row.getValue("role_id") as string;
      const role = roleOptions.find(r => r.value === (roleId ? String(roleId) : 'null'));
      return <div>{role?.label || 'Customer'}</div>;
    },
  },
  {
    accessorKey: "location_id",
    header: "Location",
    cell: ({ row }) => {
      const locationId = String(row.getValue("location_id"));
      const locations = useContext(LocationContext);
      return <div>{locations.get(locationId) || 'Unknown Location'}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionMenu user={row.original} />,
  },
];

interface Location {
  location_id: number;
  location_name: string;
}

interface LocationsResponse {
  locations: Location[];
}

export function Dashboard() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [filter, setFilter] = useState<{ role_id: number | null; location_id: number | undefined }>({
    role_id: null,
    location_id: undefined
  });
  const [progress, setProgress] = useState(0);

  const queryClient = useQueryClient();

  // Fetch locations with caching
  const { data: locationsData } = useQuery<LocationsResponse>({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await request(
        graphqlEndpoint,
        GET_ALL_LOCATIONS
      );
      console.log('Locations response:', response);
      return response;
    },
    staleTime: Infinity, // Cache locations permanently until manual invalidation
  });

  // Create memoized locations map with string keys
  const locationsMap = useMemo(() => {
    if (!locationsData?.locations) return new Map();
    return new Map(
      locationsData.locations.map(location => [
        String(location.location_id),
        location.location_name
      ])
    );
  }, [locationsData]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        table.getColumn("name")?.setFilterValue(value);
      }, 300),
    []
  );

  // Fetch users with optimized filtering
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', filter],
    queryFn: async () => {
      const queryFilter = {
        ...(filter.role_id !== null && { role_id: filter.role_id }),
        ...(filter.location_id !== undefined && { location_id: filter.location_id })
      };

      const response = await request(
        graphqlEndpoint,
        GET_FILTERED_USERS,
        { filter: Object.keys(queryFilter).length > 0 ? queryFilter : undefined }
      );
      return response.usersByLocationAndRole;
    },
  });

  // Memoize table data
  const tableData = useMemo(() => data || [], [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Memoized handlers
  const handleLocationChange = useCallback((value: string) => {
    setFilter(prev => ({
      ...prev,
      location_id: value === 'all' ? undefined : parseInt(value)
    }));
  }, []);

  const handleRoleChange = useCallback((value: string) => {
    setFilter(prev => ({
      ...prev,
      role_id: value === 'all' ? null : value === 'null' ? null : parseInt(value)
    }));
  }, []);

  // Memoized selected users
  const selectedUsers = useMemo(() => {
    return table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.name);
  }, [table, rowSelection]);

  const { mutate: deleteUsers } = useMutation({
    mutationFn: async (userIds: number[]) => {
      return request(
        graphqlEndpoint,
        DELETE_USERS,
        { userIds }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error deleting users:', error);
    }
  });

  const handleDelete = async () => {
    try {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const userIds = selectedRows.map(row => parseInt(row.original.user_id));
      
      if (userIds.length === 0) {
        console.log('No users selected');
        return;
      }

      await deleteUsers(userIds);
      
      // Clear selection after successful deletion
      table.toggleAllRowsSelected(false);
    } catch (error) {
      console.error('Failed to delete users:', error);
    }
  };

  // Add resetFilters function
  const resetFilters = useCallback(() => {
    // Reset filter state
    setFilter({ role_id: null, location_id: undefined });
    
    // Reset column filters
    table.getAllColumns().forEach((column) => {
      column.setFilterValue('');
    });
    
    // Reset sorting
    setSorting([]);
    
    // Reset row selection
    setRowSelection({});
    
    // Reset select elements to 'all'
    const locationSelect = document.querySelector('[name="location-select"]') as HTMLSelectElement;
    const roleSelect = document.querySelector('[name="role-select"]') as HTMLSelectElement;
    if (locationSelect) locationSelect.value = 'all';
    if (roleSelect) roleSelect.value = 'all';
  }, [table]);

  return (
    <LocationContext.Provider value={locationsMap}>
      <RoleContext.Provider value={{ roleOptions }}>
        <div className="w-full p-2 md:p-4 space-y-4 max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm text-muted-foreground">
                  This action cannot be undone. This will permanently delete the following users:
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {selectedUsers.map((name, index) => (
                      <li key={index} className="text-sm font-medium">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </span>
              <Button 
                onClick={resetFilters} 
                variant="outline" 
                size="sm"
                className="ml-2"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            <Input
              placeholder="Filter by name..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="min-w-[200px]"
            />
            <Select
              value={String(filter.role_id || 'all')}
              onValueChange={handleRoleChange}
              name="role-select"
            >
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(filter.location_id || 'all')}
              onValueChange={handleLocationChange}
              name="location-select"
            >
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locationsData?.locations?.map((location) => (
                  <SelectItem 
                    key={location.location_id} 
                    value={String(location.location_id)}
                  >
                    {location.location_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <div className="w-full text-center py-4 dark:text-gray-300">
              Loading...
            </div>
          ) : null}

          {error ? (
            <div className="w-full h-screen flex items-center justify-center">
              <div className="text-center text-red-500 dark:text-red-400">
                <p>Error: {(error as Error).message}</p>
              </div>
            </div>
          ) : null}

          <div className="overflow-auto border rounded-md dark:border-gray-800 dark:bg-transparent shadow-sm">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="whitespace-nowrap">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground dark:text-gray-400">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </RoleContext.Provider>
    </LocationContext.Provider>
  );
}
