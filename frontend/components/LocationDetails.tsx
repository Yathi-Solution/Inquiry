import { useLocation } from '@/hooks/useLocation';

export function LocationDetails({ locationId }: { locationId: number }) {
  const { data: location, isLoading, error } = useLocation(locationId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!location) return <div>Location not found</div>;

  return (
    <div>
      <h2>Location Details</h2>
      <p>ID: {location.location_id}</p>
      <p>Name: {location.name}</p>
    </div>
  );
} 