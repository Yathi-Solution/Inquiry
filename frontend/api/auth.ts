import axios from "axios";
import { LOGIN, CREATE_USER } from "@/graphql/queries";

const API_URL = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

if (!API_URL) {
  throw new Error(
    "API_URL is not defined. Please set NEXT_PUBLIC_GRAPHQL_ENDPOINT in your environment variables."
  );
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role_id: number;
  location_id: number;
}

export const registerUser = async (userData: RegisterUserData) => {
  try {
    const response = await axios.post(API_URL!, {
      query: CREATE_USER,
      variables: {
        createUserInput: userData
      }
    });

    return response.data.data.createUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(API_URL!, {
      query: LOGIN,
      variables: {
        email,
        password
      }
    });

    return response.data.data.login;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
