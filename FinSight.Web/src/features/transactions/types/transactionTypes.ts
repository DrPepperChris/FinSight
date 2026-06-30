export interface Transaction {
    id: number;
    accountId?: number;
    accountNumber?: string;
    transactionType?: string;
    amount?: number;
    description?: string;
    transactionDate?: string;
    createdDate?: string;
}