export interface LoanApplication {
    id: number;
    customerId?: number;
    customerName?: string;
    requestedAmount?: number;
    loanAmount?: number;
    amount?: number;
    loanPurpose?: string;
    purpose?: string;
    status?: string;
    applicationStatus?: string;
    createdDate?: string;
    submittedDate?: string;
    decisionDate?: string;
}

export interface CreateLoanApplicationRequest {
    customerId: number;
    requestedAmount: number;
    loanPurpose: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount?: number;
    totalRecords?: number;
    page?: number;
    pageNumber?: number;
    pageSize: number;
    totalPages?: number;
}