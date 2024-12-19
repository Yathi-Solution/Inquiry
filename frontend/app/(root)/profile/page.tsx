"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { request } from "graphql-request";
import { GET_ALL_LOCATIONS } from "@/graphql/queries";
import { Badge } from "@/components/ui/badge";

interface Location {
  location_id: number;
  location_name: string;
}

interface LocationsResponse {
  locations: Location[];
}

export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchLocation = async () => {
      try {
        const response = await request<LocationsResponse>(
          process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
          GET_ALL_LOCATIONS,
          {},
          { Authorization: `Bearer ${token}` }
        );
        
        const userLocation = response.locations.find(
          loc => loc.location_id === user?.location_id
        );
        if (userLocation) {
          setLocation(userLocation.location_name);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, [token, router, user]);

  if (!user) return null;

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1:
        return "Super Admin";
      case 2:
        return "Location Manager";
      case 3:
        return "Salesperson";
      default:
        return "Unknown Role";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-base sm:text-lg font-medium">{user.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-base sm:text-lg font-medium break-all">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl">Role & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="secondary" className="text-sm sm:text-base px-3 py-1">
                {getRoleName(user.role_id)}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Location</p>
              <Badge variant="outline" className="text-sm sm:text-base px-3 py-1">
                {location || "Loading..."}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:col-span-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/change-password')}
                className="w-full"
              >
                Change Password
              </Button>
              <Button 
                variant="destructive"
                className="w-full"
                onClick={() => {
                  // Add logout functionality
                }}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 