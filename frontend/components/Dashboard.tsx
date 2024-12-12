import { useQuery, useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { DataTable } from '@shadcn/ui'; // Import DataTable component from shadcn
import client from '@/lib/apollo-client';

// GraphQL Queries and Mutations
const GET_USERS = gql`
  query GetUsersByName($filter: FilterUserInput) {
    getUsersByName(filter: $filter) {
      user_id
      name
      email
      role_id
      location_id
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($userId: Int!, $name: String!, $email: String!, $roleId: Int!, $locationId: Int!) {
    updateUser(userId: $userId, name: $name, email: $email, roleId: $roleId, locationId: $locationId) {
      user_id
      name
      email
      role_id
      location_id
    }
  }
`;

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userLocation, setUserLocation] = useState('');

  const { data, loading, error } = useQuery(GET_USERS, {
    variables: {
      filter: {
        name: search,
        sortByName: sortDirection,
      },
    },
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    onCompleted: () => {
      setOpen(false);
    },
  });

  const handleSortRequest = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role_id);
    setUserLocation(user.location_id);
    setOpen(true);
  };

  const handleSaveChanges = () => {
    updateUser({
      variables: {
        userId: selectedUser.user_id,
        name: userName,
        email: userEmail,
        roleId: userRole,
        locationId: userLocation,
      },
    });
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* Navbar */}
      <div style={{ marginBottom: '20px' }}>
        <TextField
          label="Search by Name"
          value={search}
          onChange={handleSearchChange}
          variant="outlined"
        />
      </div>

      {/* Shadcn DataTable */}
      <DataTable
        data={data.getUsersByName}
        columns={[
          {
            Header: 'Name',
            accessor: 'name',
            sort: true,
          },
          {
            Header: 'Email',
            accessor: 'email',
          },
          {
            Header: 'Role ID',
            accessor: 'role_id',
          },
          {
            Header: 'Location ID',
            accessor: 'location_id',
          },
          {
            Header: 'Actions',
            Cell: (row) => (
              <Button variant="contained" onClick={() => handleEditClick(row.row.original)}>
                Edit
              </Button>
            ),
          },
        ]}
        sortBy={sortDirection}
        onSortChange={handleSortRequest}
      />

      {/* Edit Modal */}
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Role ID"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            fullWidth
          />
          <TextField
            label="Location ID"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// Server-Side Rendering (SSR) with getServerSideProps
export async function getServerSideProps() {
  const { data } = await client.query({
    query: GET_USERS,
  });

  return {
    props: {
      users: data.getUsersByName,
    },
  };
}
