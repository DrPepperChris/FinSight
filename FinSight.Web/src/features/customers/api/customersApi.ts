import { apiClient } from "../../../lib/apiClient";
import type {
    CreateCustomerRequest,
    Customer,
    PagedResult
} from "../types/customerTypes";

export async function getCustomers(): Promise<PagedResult<Customer>> {
    const response = await apiClient.get<PagedResult<Customer>>("/api/Customers", {
        params: {
            pageNumber: 1,
            pageSize: 25
        }
    });

    console.log("Customers paged response:", response.data);

    return response.data;
}

export async function createCustomer(
    request: CreateCustomerRequest
): Promise<Customer> {
    const response = await apiClient.post<Customer>("/api/Customers", request);
    return response.data;
}