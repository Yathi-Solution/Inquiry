import { gql } from "@apollo/client";

// Define TypeScript interfaces for GraphQL query/mutation inputs and outputs
export interface User {
  user_id: string;
  name: string;
  email: string;
  role_id: string;
  location_id: string;
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

// GraphQL Queries and Mutations
export const GET_ALL_USERS = gql`
  query {
    users {
      user_id
      name
      email
      role_id
      location_id
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
      role_id
      location_id
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      user_id
      name
      email
      role_id
      location_id
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
