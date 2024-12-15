import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './models/location.model';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async createLocation(createLocationDto: CreateLocationDto): Promise<Location> {
    return this.prisma.location.create({
      data: {
        location_name: createLocationDto.location_name,
      },
    });
  }

  async getAllLocations(): Promise<Location[]> {
    try {
      const locations = await this.prisma.location.findMany({
        orderBy: {
          location_id: 'asc',
        },
      });
      console.log('Retrieved locations:', locations); // Debug log
      return locations;
    } catch (error) {
      console.error('Error in getAllLocations:', error);
      throw error;
    }
  }

  async deleteLocation(location_id: number): Promise<Location> {
    return this.prisma.location.delete({
      where: { location_id },
    });
  }

  async getLocationById(location_id: number): Promise<Location | null> {
    try {
      const location = await this.prisma.location.findUnique({
        where: { location_id },
      });
      
      if (!location) {
        console.log(`No location found with id: ${location_id}`);
        return null;
      }

      console.log('Retrieved location:', location); // Debug log
      return location;
    } catch (error) {
      console.error(`Error getting location with id ${location_id}:`, error);
      throw error;
    }
  }
} 