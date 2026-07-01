export interface PagedResult<T> {
    items?: T[];
    data?: T[];
    results?: T[];
    totalCount?: number;
    totalRecords?: number;
    count?: number;
}

export interface Account {
    id: number;
    accountNumber?: string;
    customerId?: number;
    customerName?: string;
    accountType?: string;
    availableBalance?: number;
    balance?: number;
    status?: string;
    createdDate?: string;
}

export interface CreateAccountRequest {
    customerId: number;
    accountType: string;
    initialDeposit?: number;
    balance?: number;
}