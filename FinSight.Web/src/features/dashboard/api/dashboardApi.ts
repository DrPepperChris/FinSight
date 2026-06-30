import { getAccounts } from "../../accounts/api/accountsApi";
import { getCustomers } from "../../customers/api/customersApi";
import { getLoanApplications } from "../../loans/api/loanApplicationsApi";
import type { DashboardSummary } from "../types/dashboardTypes";

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const [customersResult, accountsResult, loansResult] = await Promise.all([
        getCustomers(),
        getAccounts(),
        getLoanApplications()
    ]);

    const loanApplications = loansResult.items ?? [];

    const openLoanApplicationCount = loanApplications.filter((loan) => {
        const status = loan.status ?? loan.applicationStatus ?? "";
        return (
            status.toLowerCase() !== "approved" &&
            status.toLowerCase() !== "rejected"
        );
    }).length;

    return {
        customerCount:
            customersResult.totalCount ??
            customersResult.totalRecords ??
            customersResult.items?.length ??
            0,

        accountCount:
            accountsResult.totalCount ??
            accountsResult.totalRecords ??
            accountsResult.items?.length ??
            0,

        loanApplicationCount:
            loansResult.totalCount ??
            loansResult.totalRecords ??
            loansResult.items?.length ??
            0,

        openLoanApplicationCount
    };
}