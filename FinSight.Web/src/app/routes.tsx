import { Route, Routes } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { AccountsPage } from "../features/accounts/pages/AccountsPage";
import { TransactionsPage } from "../features/transactions/pages/TransactionsPage";
import { LoanApplicationsPage } from "../features/loans/pages/LoanApplicationsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/loans" element={<LoanApplicationsPage />} />
    </Routes>
  );
}