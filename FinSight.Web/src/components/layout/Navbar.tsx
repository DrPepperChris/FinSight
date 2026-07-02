import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext/AuthContext";

export function Navbar() {
    const { isAuthenticated, role, logoutUser, hasRole } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutUser();
        navigate("/login");
    }

    function getNavClass({ isActive }: { isActive: boolean }) {
        return isActive ? "nav-link active-nav-link" : "nav-link";
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">FinSight</div>

            <div className="navbar-links">
                {isAuthenticated && hasRole(["Admin", "Auditor"]) && (
                    <NavLink to="/" className={getNavClass}>
                        Dashboard
                    </NavLink>
                )}

                {isAuthenticated && hasRole(["Admin", "Auditor"]) && (
                    <NavLink to="/customers" className={getNavClass}>
                        Customers
                    </NavLink>
                )}

                {isAuthenticated && hasRole(["Admin", "Auditor", "Analyst"]) && (
                    <NavLink to="/accounts" className={getNavClass}>
                        Accounts
                    </NavLink>
                )}

                {isAuthenticated && hasRole(["Admin", "Analyst"]) && (
                    <NavLink to="/transactions" className={getNavClass}>
                        Transactions
                    </NavLink>
                )}

                {isAuthenticated && hasRole(["Admin", "Auditor"]) && (
                    <NavLink to="/loans" className={getNavClass}>
                        Loans
                    </NavLink>
                )}

                {isAuthenticated && hasRole(["Admin", "Auditor"]) && (
                    <NavLink to="/audit-logs" className={getNavClass}>
                        Audit Logs
                    </NavLink>
                )}

                {isAuthenticated && hasRole(["Admin", "Auditor"]) && (
                    <NavLink to="/analytics" className={getNavClass}>
                        Analytics
                    </NavLink>
                )}

                {!isAuthenticated && (
                    <NavLink to="/login" className={getNavClass}>
                        Login
                    </NavLink>
                )}

                {isAuthenticated && hasRole(["Admin", "Auditor"]) && (
                    <NavLink to="/ingestion-engine" className={getNavClass}>
                        Ingestion Engine
                    </NavLink>
                )}
            </div>

            <div className="navbar-actions">
                {isAuthenticated && (
                    <>
                        <span className="role-badge">{role ?? "User"}</span>
                        <button type="button" className="button secondary-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}