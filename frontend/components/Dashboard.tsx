"use client";

import React, { useState } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    }
  });

  const handleSave = async () => {
    try {
      const updatePayload = {
        user_id: user.user_id,
        name: updatedUser.name || user.name,
        email: updatedUser.email || user.email,
        role_id: updatedUser.role_id || user.role_id,
        location_id: updatedUser.location_id || user.location_id
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Name"
              defaultValue={user.name}
              onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Email"
              defaultValue={user.email}
              onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Role ID"
              defaultValue={user.role_id}
              onChange={(e) => setUpdatedUser({ ...updatedUser, role_id: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Location ID"
              defaultValue={user.location_id}
              onChange={(e) => setUpdatedUser({ ...updatedUser, location_id: e.target.value })}
            />
          </div>
          <Button onClick={handleSave} className="w-full">Save changes</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
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
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Filter by name..."
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
        />
        <Input
          placeholder="Filter by role ID..."
          onChange={(e) => table.getColumn("role_id")?.setFilterValue(e.target.value)}
        />
        <Input
          placeholder="Filter by location ID..."
          onChange={(e) => table.getColumn("location_id")?.setFilterValue(e.target.value)}
        />
      </div>
      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
