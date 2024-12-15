import axios from "axios";

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
    const mutation = `
      mutation CreateUser($createUserInput: CreateUserInput!) {
        createUser(createUserInput: $createUserInput) {
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

    const response = await axios.post(
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
      {
        query: mutation,
        variables: {
          createUserInput: userData
        }
      }
    );

    return response.data.data.createUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  const query = `
    mutation {
      login(email: "${email}", password: "${password}") {
         user {
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
        access_token
      }
    }
  `;

  const response = await axios.post(API_URL, {
    query,
  });

  return response.data.data.login; // Adjust based on your GraphQL response structure
};
