import { request } from "graphql-request";
import { GET_ALL_USERS } from "@/graphql/queries";
import { useAuth } from '@/context/AuthContext';

interface User {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
  location_id: number;
}

interface GetAllUsersResponse {
  users: User[];
}

export const fetchAllUsers = async (): Promise<User[]> => {
  const { token } = useAuth(); // Get the token from context

  if (!token) {
    throw new Error("No token found. User might not be logged in.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await request<GetAllUsersResponse>("http://localhost:4000/graphql", GET_ALL_USERS, {
    headers,
  });

  return response.users; // Now response is correctly typed
}; 