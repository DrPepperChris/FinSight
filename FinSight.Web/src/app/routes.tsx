import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { AccountsPage } from "../features/accounts/pages/AccountsPage";
import { TransactionsPage } from "../features/transactions/pages/TransactionsPage";
import { LoanApplicationsPage } from "../features/loans/pages/LoanApplicationsPage";

export function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/customers"
                element={
                    <ProtectedRoute>
                        <CustomersPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/accounts"
                element={
                    <ProtectedRoute>
                        <AccountsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/transactions"
                element={
                    <ProtectedRoute>
                        <TransactionsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/loans"
                element={
                    <ProtectedRoute>
                        <LoanApplicationsPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}