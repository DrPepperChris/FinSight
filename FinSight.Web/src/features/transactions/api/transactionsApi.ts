import { apiClient } from "../../../lib/apiClient";
import type { Transaction } from "../types/transactionTypes";

export async function getAccountTransactions(
    accountId: number
): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(
        `/api/Accounts/${accountId}/transactions`
    );

    console.log("Account transactions response:", response.data);

    return response.data;
}