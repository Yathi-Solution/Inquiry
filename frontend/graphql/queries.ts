import { gql } from 'graphql-request';

// Define TypeScript interfaces for GraphQL query/mutation inputs and outputs
export interface User {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
  location_id: number;
  role_name?: string;
  roles?: {
    role_name: string;
  };
}

export interface UpdateUserInput {
  user_id: string;
  name?: string;
  email?: string;
  role_id?: string;
  location_id?: string;
}

export interface FilterUserInput {
  name?: string;
  sortByName?: "asc" | "desc";
  role_id?: string;
  location_id?: string;
}

// Add interface for Location
export interface Location {
  location_id: number;
  location_name: string;
}

// Add new Auth related interfaces
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    user_id: number;
    name: string;
    email: string;
    location_id: number;
    role_id: number;
    roles: {
      role_id: number;
      role_name: string;
    };
    locations: {
      location_id: number;
      location_name: string;
    };
  };
}

// Add Activity Log related interfaces
export interface ActivityLog {
  log_id: string;
  activity: string;
  log_type: string;
  created_at: string;
  users: {
    name: string;
  };
}

// First, add the interface for the mutation input
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role_id: number;
  location_id: number;
}

// Then, add the interface for the response
export interface CreateUserResponse {
  createUser: {
    user_id: number;
    name: string;
    email: string;
    roles: {
      role_name: string;
    };
    locations: {
      location_name: string;
    };
  }
}

// GraphQL Queries and Mutations
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      user_id
      name
      email
      role_id
      location_id
      roles {
        role_id
        role_name
      }
      locations {
        location_id
        location_name
      }
    }
  }
`;

export const GET_USERS_BY_NAME = gql`
  query GetUsersByName($filter: FilterUserInput) {
    getUsersByName(filter: $filter) {
      user_id
      name
      email
    }
  }
`;

export const GET_FILTERED_USERS = gql`
  query GetFilteredUsers($filter: FilterUserInput) {
    usersByLocationAndRole(filter: $filter) {
      user_id
      name
      email
      role {
        role_name
      }
      location {
        location_name
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      user_id
      name
      email
      roles {
        role_id
        role_name
      }
      locations {
        location_id
        location_name
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($id: ID!) {
    deleteUser(id: $id) {
      user_id
    }
  }
`;

export const DELETE_USERS = gql`
  mutation DeleteUsers($userIds: [Int!]!) {
    deleteUsers(userIds: $userIds)
  }
`;

// Add the query for fetching all locations
export const GET_ALL_LOCATIONS = gql`
  query GetAllLocations {
    locations {
      location_id
      location_name
    }
  }
`;

export const GET_LOCATION_BY_ID = gql`
  query GetLocationById($input: GetLocationInput!) {
    locationById(input: $input) {
      location_id
      location_name
    }
  }
`;

// Add Auth Mutation
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access_token
      user {
        user_id
        name
        email
        location_id
        role_id
        roles {
          role_id
          role_name
        }
        locations {
          location_id
          location_name
        }
      }
    }
  }
`;

// Add Activity Log Queries
export const GET_ACTIVITY_LOGS = gql`
  query GetActivityLogs($filter: FilterActivityLogInput) {
    getActivityLogs(filter: $filter) {
      log_id
      activity
      log_type
      created_at
      users {
        name
      }
    }
  }
`;

export const GET_USER_LOGS = gql`
  query GetUserLogs($userId: Int!) {
    getUserLogs(userId: $userId) {
      log_id
      activity
      log_type
      created_at
    }
  }
`;

export const GET_CUSTOMER_LOGS = gql`
  query GetCustomerLogs($customerId: Int!) {
    getCustomerLogs(customerId: $customerId) {
      log_id
      activity
      created_at
      users {
        name
      }
    }
  }
`;

export const GET_ASSIGNMENT_LOGS = gql`
  query GetAssignmentLogs($assignmentId: Int!) {
    getAssignmentLogs(assignmentId: $assignmentId) {
      log_id
      activity
      log_type
      created_at
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($createCustomerInput: CreateCustomerInput!) {
    createCustomer(createCustomerInput: $createCustomerInput) {
      customer_id
      name
      email
      phone
      location_id
      visit_date
      notes
      status
      created_at
      updated_at
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      user_id
      name
      email
      roles {
        role_name
      }
      locations {
        location_name
      }
    }
  }
`;

export const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      location_id
      location_name
    }
  }
`;

// Add Customer interfaces
export interface Customer {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  location_id: number;
  salesperson_id: number;
  visit_date: Date;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  users?: {
    name: string;
  };
  locations?: {
    location_name: string;
  };
}

export interface FilterCustomersInput {
  salesperson_id?: number;
  location_id?: number;
  name?: string;
  status?: string;
  visitDateFrom?: Date;
  visitDateTo?: Date;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  sortBy?: 'name' | 'visit_date' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Add Customers Query
export const GET_CUSTOMERS = gql`
  query GetCustomers($filters: FilterCustomersInput) {
    getCustomers(filters: $filters) {
      customer_id
      name
      email
      phone
      location_id
      salesperson_id
      visit_date
      status
      notes
      created_at
      updated_at
    }
  }
`;

export const GET_SALESPEOPLE = gql`
  query GetSalespeople {
    salespeople {
      user_id
      name
      location_id
    }
  }
`;

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  visit_date?: Date;
  status?: string;
  notes?: string;
}

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($customerId: Int!, $updateData: UpdateCustomerInput!) {
    updateCustomer(customerId: $customerId, updateData: $updateData) {
      customer_id
      name
      email
      phone
      location_id
      salesperson_id
      visit_date
      status
      notes
      created_at
      updated_at
    }
  }
`;

// Get salespeople by location
export const GET_SALESPEOPLE_BY_LOCATION = gql`
  query GetSalespeopleByLocation($location_id: Int!) {
    getSalespeopleByLocation(location_id: $location_id) {
      user_id
      name
      role_id
      location_id
    }
  }
`;

// Get location salespeople (for location manager)
export const GET_LOCATION_SALESPEOPLE = gql`
  query GetLocationSalespeople($location_id: Int!) {
    getSalespeopleByLocation(location_id: $location_id) {
      user_id
      name
      role_id
    }
  }
`;

