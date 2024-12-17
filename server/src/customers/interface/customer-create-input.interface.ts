// src/customers/interfaces/customer-create-input.interface.ts
import { CreateCustomerInput } from '../dto/create-customer.dto';

export interface CustomerCreateInput extends CreateCustomerInput {
  location_id: number; // Required field
  salesperson_id: number; // Required field
}