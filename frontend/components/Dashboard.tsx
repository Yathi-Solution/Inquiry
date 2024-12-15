"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "graphql-request";
import { ArrowUpDown, Trash2, RefreshCw, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/context/AuthContext';
import { GET_ALL_USERS, DELETE_USERS, UPDATE_USER } from "@/graphql/queries";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!;

interface EditingUser {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
  location_id: number;
  role?: {
    role_id: number;
    role_name: string;
  };
  location?: {
    location_id: number;
    location_name: string;
  };
}

export default function Dashboard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await request(
        graphqlEndpoint,
        GET_ALL_USERS,
        {},
        { Authorization: `Bearer ${token}` }
      );
      return (response as { users: any[] }).users;
    },
    enabled: !!token
  });

  const uniqueRoles = useMemo(() => {
    if (!data) return [];
    const rolesMap = new Map();
    data.forEach(user => {
      if (user.role && !rolesMap.has(user.role.role_id)) {
        rolesMap.set(user.role.role_id, {
          role_id: user.role.role_id,
          role_name: user.role.role_name
        });
      }
    });
    return Array.from(rolesMap.values());
  }, [data]);

  const uniqueLocations = useMemo(() => {
    if (!data) return [];
    const locationsMap = new Map();
    data.forEach(user => {
      if (user.location && !locationsMap.has(user.location.location_id)) {
        locationsMap.set(user.location.location_id, {
          location_id: user.location.location_id,
          location_name: user.location.location_name
        });
      }
    });
    return Array.from(locationsMap.values());
  }, [data]);

  useEffect(() => {
    if (editingUser) {
      console.log('Editing User:', editingUser);
      console.log('Unique Roles:', uniqueRoles);
      console.log('Unique Locations:', uniqueLocations);
    }
  }, [editingUser, uniqueRoles, uniqueLocations]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(user => {
      const matchesRole = 
        roleFilter === 'all' || 
        user.role?.role_id?.toString() === roleFilter;
      
      const matchesLocation = 
        locationFilter === 'all' || 
        user.location?.location_id?.toString() === locationFilter;
      
      const matchesName = 
        user.name?.toLowerCase().includes(nameFilter.toLowerCase());
      
      return matchesRole && matchesLocation && matchesName;
    });
  }, [data, roleFilter, locationFilter, nameFilter]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      id: "name",
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
      accessorKey: "name",
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "role",
      header: "Role",
      accessorFn: (row) => row.role.role_name,
    },
    {
      id: "location",
      header: "Location",
      accessorFn: (row) => row.location.location_name,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const user = row.original;
            setEditingUser({
              ...user,
              role_id: user.role.role_id,
              location_id: user.location.location_id,
              role: user.role,
              location: user.location
            });
            setSelectedRow(row);
            setSheetOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )
    },
  ], [uniqueRoles, uniqueLocations, editingUser]);

  const table = useReactTable({
    data: filteredData,
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

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.user_id);
    
    if (selectedIds.length === 0) return;

    try {
      await request(
        graphqlEndpoint,
        DELETE_USERS,
        { userIds: selectedIds },
        { Authorization: `Bearer ${token}` }
      );
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    if (!editingUser.name || !editingUser.email || !editingUser.role_id || !editingUser.location_id) {
      alert('All fields are required');
      return;
    }
    
    setIsUpdating(true);
    try {
      await request(
        graphqlEndpoint,
        UPDATE_USER,
        {
          updateUserInput: {
            user_id: editingUser.user_id,
            name: editingUser.name,
            email: editingUser.email,
            role_id: parseInt(editingUser.role_id.toString()),
            location_id: parseInt(editingUser.location_id.toString()),
          }
        },
        { Authorization: `Bearer ${token}` }
      );
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    } catch (error) {
      alert('Error updating user');
      console.error('Error updating user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetFilters = useCallback(() => {
    setNameFilter('');
    setRoleFilter('all');
    setLocationFilter('all');
  }, []);

  useEffect(() => {
    return () => {
      setEditingUser(null);
      setIsUpdating(false);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-2 md:p-4 space-y-4 max-w-[1400px] mx-auto">
        <div className="w-full h-[200px] flex flex-col items-center justify-center gap-4">
          <div className="text-center text-muted-foreground">Loading...</div>
          <Progress value={45} className="w-[60%] max-w-[400px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          Error loading data
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 md:p-4 space-y-4 max-w-[1400px] mx-auto">
      <div className="flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="max-w-sm"
          />

          <Select
            value={roleFilter}
            onValueChange={(value) => {
              console.log('Selected role:', value);
              setRoleFilter(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem 
                  key={`filter-role-${role.role_id}`}
                  value={role.role_id.toString()}
                >
                  {role.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={locationFilter}
            onValueChange={(value) => {
              console.log('Selected location:', value);
              setLocationFilter(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem 
                  key={`filter-location-${location.location_id}`}
                  value={location.location_id.toString()}
                >
                  {location.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>Name</label>
                <Input
                  value={editingUser.name || ''}
                  onChange={(e) => 
                    setEditingUser(prev => prev ? {
                      ...prev,
                      name: e.target.value
                    } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Email</label>
                <Input
                  value={editingUser.email || ''}
                  onChange={(e) => 
                    setEditingUser(prev => prev ? {
                      ...prev,
                      email: e.target.value
                    } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Role</label>
                <Select 
                  value={editingUser.role_id?.toString()}
                  onValueChange={(value) => {
                    setEditingUser(prev => prev ? {
                      ...prev,
                      role_id: parseInt(value),
                      role: uniqueRoles.find(role => role.role_id.toString() === value)
                    } : null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {editingUser.role?.role_name || "Select role"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueRoles.map((role) => (
                      <SelectItem 
                        key={`select-role-${role.role_id}`}
                        value={role.role_id.toString()}
                      >
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Location</label>
                <Select 
                  value={editingUser.location_id?.toString()}
                  onValueChange={(value) => {
                    setEditingUser(prev => prev ? {
                      ...prev,
                      location_id: parseInt(value),
                      location: uniqueLocations.find(location => location.location_id.toString() === value)
                    } : null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {editingUser.location?.location_name || "Select location"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueLocations.map((location) => (
                      <SelectItem 
                        key={`select-location-${location.location_id}`}
                        value={location.location_id.toString()}
                      >
                        {location.location_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingUser(null);
                    setSheetOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    await handleUpdateUser();
                    setSheetOpen(false);
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
