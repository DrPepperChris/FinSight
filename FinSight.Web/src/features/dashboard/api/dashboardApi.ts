import { apiClient } from "../../../lib/apiClient";
import type { Customer } from "../../customers/types/customerTypes";
import type { Account } from "../../accounts/types/accountTypes";
import type { Transaction } from "../../transactions/types/transactionTypes";
import type { LoanApplication } from "../../loans/types/loanApplicationTypes";
import type { DashboardSummary } from "../types/dashboardTypes";

interface PagedResult<T> {
    items?: T[];
    data?: T[];
    results?: T[];
    totalCount?: number;
    totalRecords?: number;
    count?: number;
}

type ApiCollection<T> = PagedResult<T> | T[];

function getPagedItems<T>(result: ApiCollection<T>): T[] {
    if (Array.isArray(result)) {
        return result;
    }

    return result.items ?? result.data ?? result.results ?? [];
}

function getPagedTotal<T>(result: ApiCollection<T>): number {
    if (Array.isArray(result)) {
        return result.length;
    }

    return (
        result.totalCount ??
        result.totalRecords ??
        result.count ??
        getPagedItems(result).length
    );
}

function getLoanStatus(loan: LoanApplication): string {
    return String(
        loan.status ??
        loan.Status ??
        loan.applicationStatus ??
        loan.ApplicationStatus ??
        ""
    ).toLowerCase();
}

async function getCustomers(): Promise<ApiCollection<Customer>> {
    const response = await apiClient.get<ApiCollection<Customer>>("/api/Customers");
    return response.data;
}

async function getAccounts(): Promise<ApiCollection<Account>> {
    const response = await apiClient.get<ApiCollection<Account>>("/api/Accounts");
    return response.data;
}

async function getTransactions(): Promise<ApiCollection<Transaction>> {
    try {
        const response = await apiClient.get<ApiCollection<Transaction>>("/api/Transactions");
        return response.data;
    } catch {
        const response = await apiClient.get<ApiCollection<Transaction>>("/api/BankTransactions");
        return response.data;
    }
}

async function getLoanApplications(): Promise<ApiCollection<LoanApplication>> {
    const response = await apiClient.get<ApiCollection<LoanApplication>>("/api/LoanApplications");
    return response.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const [customersResult, accountsResult, transactionsResult, loansResult] =
        await Promise.allSettled([
            getCustomers(),
            getAccounts(),
            getTransactions(),
            getLoanApplications()
        ]);

    const customers =
        customersResult.status === "fulfilled" ? customersResult.value : [];

    const accounts =
        accountsResult.status === "fulfilled" ? accountsResult.value : [];

    const transactions =
        transactionsResult.status === "fulfilled" ? transactionsResult.value : [];

    const loans =
        loansResult.status === "fulfilled" ? loansResult.value : [];

    const accountItems = getPagedItems(accounts);
    const transactionItems = getPagedItems(transactions);
    const loanItems = getPagedItems(loans);

    const totalCustomers = getPagedTotal(customers);
    const totalAccounts = getPagedTotal(accounts);
    const totalTransactions = getPagedTotal(transactions);
    const totalLoanApplications = getPagedTotal(loans);

    const totalBalance = accountItems.reduce(
        (sum, account) => sum + (account.availableBalance ?? account.balance ?? 0),
        0
    );

    const totalTransactionVolume = transactionItems.reduce(
        (sum, transaction) => sum + Math.abs(transaction.amount ?? 0),
        0
    );

    const pendingLoanApplications = loanItems.filter((loan) => {
        const status = getLoanStatus(loan);
        return status === "pending" || status === "submitted" || status === "underreview";
    }).length;

    const approvedLoanApplications = loanItems.filter((loan) => {
        const status = getLoanStatus(loan);
        return status === "approved";
    }).length;

    return {
        totalCustomers,
        totalAccounts,
        totalBalance,
        totalTransactions,
        totalTransactionVolume,
        totalLoanApplications,
        pendingLoanApplications,
        approvedLoanApplications,

        customerCount: totalCustomers,
        accountCount: totalAccounts,
        loanApplicationCount: totalLoanApplications,
        openLoanApplicationCount: pendingLoanApplications
    };
}