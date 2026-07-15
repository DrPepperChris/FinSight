import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { AccountsPage } from "../features/accounts/pages/AccountsPage";
import { TransactionsPage } from "../features/transactions/pages/TransactionsPage";
import { LoanApplicationsPage } from "../features/loans/pages/LoanApplicationsPage";
import { AuditLogsPage } from "../features/audit/pages/AuditLogsPage";
import { AnalyticsPage } from "../features/analytics/pages/AnalyticsPage";
import { IngestionEnginePage } from "../features/ingestion/pages/IngestionEnginePage";
import { MlAiPage } from "../features/mlai/pages/MlAiPage";

function UnauthorizedPage() {
    return (
        <section className="page-card">
            <h1>Unauthorized</h1>
            <p>You do not have permission to view this page.</p>
        </section>
    );
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor"]}>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/customers"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor"]}>
                        <CustomersPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/accounts"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor", "Analyst"]}>
                        <AccountsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/transactions"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Analyst"]}>
                        <TransactionsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/loans"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor"]}>
                        <LoanApplicationsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/audit-logs"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor"]}>
                        <AuditLogsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/analytics"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor"]}>
                        <AnalyticsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ingestion-engine"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor"]}>
                        <IngestionEnginePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ml-ai"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Auditor", "Analyst"]}>
                        <MlAiPage />
                    </ProtectedRoute>
                }
            />

            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<UnauthorizedPage />} />
        </Routes>
    );
}