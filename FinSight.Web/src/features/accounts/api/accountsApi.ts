import { apiClient } from "../../../lib/apiClient";
import type { Account, CreateAccountRequest, PagedResult } from "../types/accountTypes";

export async function getAccounts(): Promise<PagedResult<Account>> {
    const response = await apiClient.get<PagedResult<Account>>("/api/Accounts", {
        params: {
            pageNumber: 1,
            pageSize: 25
        }
    });

    console.log("Accounts paged response:", response.data);

    return response.data;
}

export async function createAccount(
    request: CreateAccountRequest
): Promise<Account> {
    const response = await apiClient.post<Account>("/api/Accounts", request);
    return response.data;
}