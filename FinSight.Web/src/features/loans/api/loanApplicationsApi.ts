import { apiClient } from "../../../lib/apiClient";
import type {
    CreateLoanApplicationRequest,
    LoanApplication,
    PagedResult
} from "../types/loanApplicationTypes";

export async function getLoanApplications(): Promise<PagedResult<LoanApplication>> {
    const response = await apiClient.get<PagedResult<LoanApplication>>(
        "/api/LoanApplications",
        {
            params: {
                pageNumber: 1,
                pageSize: 25
            }
        }
    );

    console.log("Loan applications response:", response.data);

    return response.data;
}

export async function createLoanApplication(
    request: CreateLoanApplicationRequest
): Promise<LoanApplication> {
    const response = await apiClient.post<LoanApplication>(
        "/api/LoanApplications",
        request
    );

    return response.data;
}

export async function approveLoanApplication(id: number): Promise<void> {
    await apiClient.post(`/api/LoanApplications/${id}/approve`);
}

export async function rejectLoanApplication(id: number): Promise<void> {
    await apiClient.post(`/api/LoanApplications/${id}/reject`);
}