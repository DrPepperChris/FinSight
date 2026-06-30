export interface Account {
    id: number;
    accountNumber?: string;
    customerId?: number;
    customerName?: string;
    accountType?: string;
    balance?: number;
    status?: string;
    createdDate?: string;
}

export interface CreateAccountRequest {
    customerId: number;
    accountType: string;
    initialDeposit: number;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages?: number;
}