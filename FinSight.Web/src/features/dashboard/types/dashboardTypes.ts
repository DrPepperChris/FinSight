export interface DashboardSummary {
    totalCustomers: number;
    totalAccounts: number;
    totalBalance: number;
    totalTransactions: number;
    totalTransactionVolume: number;
    totalLoanApplications: number;
    pendingLoanApplications: number;
    approvedLoanApplications: number;

    customerCount: number;
    accountCount: number;
    loanApplicationCount: number;
    openLoanApplicationCount: number;
}