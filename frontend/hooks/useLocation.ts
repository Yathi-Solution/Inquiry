import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { GET_LOCATION_BY_ID } from '@/graphql/queries';

const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!;

export function useLocation(id: number) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: async () => {
      const response = await request(
        graphqlEndpoint,
        GET_LOCATION_BY_ID,
        { id }
      );
      return (response as { locationById: any }).locationById;
    },
    enabled: !!id, // Only run query if id is provided
  });
}