export type LoanType =
    | "Auto"
    | "Personal"
    | "Mortgage"
    | "Business"
    | "Student"
    | "DebtConsolidation"
    | "Other";

export interface LoanApplication {
    id: number;
    customerId?: number;
    customerName?: string;
    applicationNumber?: string;

    requestedAmount?: number;
    loanAmount?: number;
    amount?: number;

    loanType?: LoanType | string;
    LoanType?: LoanType | string;

    loanPurpose?: string;
    LoanPurpose?: string;

    purpose?: string;
    Purpose?: string;

    status?: string | number;
    Status?: string | number;

    applicationStatus?: string | number;
    ApplicationStatus?: string | number;

    createdDate?: string;
    submittedDate?: string;
    applicationDate?: string;
    decisionDate?: string;
}

export interface CreateLoanApplicationRequest {
    customerId: number;
    requestedAmount: number;
    loanType: LoanType;
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