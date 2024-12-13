import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { LocationsService } from './locations.service';
import { Location } from './models/location.model';
import { CreateLocationDto } from './dto/create-location.dto';

@Resolver('Location')
export class LocationsResolver {
  constructor(private locationsService: LocationsService) {}

  @Query(() => [Location])
  async locations() {
    try {
      const locations = await this.locationsService.getAllLocations();
      console.log('Fetched locations:', locations); // Debug log
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  @Query(() => Location)
  async location(
    @Args('location_id', { type: () => Int }) location_id: number,
  ): Promise<Location> {
    return this.locationsService.getLocationById(location_id);
  }

  @Mutation(() => Location)
  async createLocation(
    @Args('createLocationInput') createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationsService.createLocation(createLocationDto);
  }

  @Mutation(() => Location)
  async deleteLocation(
    @Args('location_id', { type: () => Int }) location_id: number,
  ): Promise<Location> {
    return this.locationsService.deleteLocation(location_id);
  }

  @Query(() => Location, { nullable: true })
  async locationById(@Args('id', { type: () => Int }) id: number) {
    try {
      const location = await this.locationsService.getLocationById(id);
      console.log('Fetched location by id:', location); // Debug log
      return location;
    } catch (error) {
      console.error('Error fetching location by id:', error);
      throw error;
    }
  }
} 