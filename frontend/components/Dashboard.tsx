"use client";

import React, { useState, useRef } from "react";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ArrowUpDown } from "lucide-react";

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
        gql`
          mutation UpdateUser($updateUserInput: UpdateUserInput!) {
            updateUser(updateUserInput: $updateUserInput) {
              user_id
              name
              email
              role_id
              location_id
            }
          }
        `,
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

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role_id", header: "Role ID" },
  { accessorKey: "location_id", header: "Location ID" },
  {
    id: "actions",
    cell: ({ row }) => <ActionMenu user={row.original} />,
  },
];

export function Dashboard() {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await request(
        graphqlEndpoint,
        gql`
          query GetAllUsers {
            users {
              user_id
              name
              email
              role_id
              location_id
            }
          }
        `
      );
      const typedResponse = response as { users: User[] };
      return typedResponse.users;
    }
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;
  if (!data?.length) return <p>No users found</p>;

  return (
    <div className="w-full p-2 md:p-4 space-y-4 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        <Input
          placeholder="Filter by name..."
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
          className="min-w-[200px]"
        />
        <Input
          placeholder="Filter by role ID..."
          onChange={(e) => table.getColumn("role_id")?.setFilterValue(e.target.value)}
          className="min-w-[200px]"
        />
        <Input
          placeholder="Filter by location ID..."
          onChange={(e) => table.getColumn("location_id")?.setFilterValue(e.target.value)}
          className="min-w-[200px]"
        />
      </div>
      <div className="overflow-auto border rounded-md bg-white shadow-sm">
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
    </div>
  );
}
