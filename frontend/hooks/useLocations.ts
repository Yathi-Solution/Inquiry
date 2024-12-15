import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { GET_ALL_LOCATIONS } from '@/graphql/queries';

const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!;

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await request(
        graphqlEndpoint,
        GET_ALL_LOCATIONS
      );
      return (response as { locations: any[] }).locations;
    },
  });
}