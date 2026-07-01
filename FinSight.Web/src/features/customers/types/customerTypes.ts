export interface Customer {
    id: number;
    customerNumber: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    riskRating: string;
    createdDate?: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    totalRecords?: number;
    pageNumber: number;
    pageSize: number;
    totalPages?: number;
}

export interface CreateCustomerRequest {
    firstName: string;
    lastName: string;
    email: string;
    riskRating: string;
}