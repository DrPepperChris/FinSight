import { useEffect, useState } from "react";
import {
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useAuth } from "../../features/auth/authContext/AuthContext";

export function Navbar() {
    const { isAuthenticated, role, logoutUser, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        setIsMobileMenuOpen(false);
        logoutUser();
        navigate("/login");
    }

    function getNavClass({ isActive }: { isActive: boolean }) {
        return isActive ? "nav-link active-nav-link" : "nav-link";
    }

    function toggleMobileMenu() {
        setIsMobileMenuOpen((currentValue) => !currentValue);
    }

    return (
        <nav
            className={`navbar ${isMobileMenuOpen ? "mobile-menu-open" : ""
                }`}
        >
            <div className="navbar-brand">FinSight</div>

            {isAuthenticated && (
                <button
                    type="button"
                    className="mobile-menu-button"
                    aria-label={
                        isMobileMenuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="finsight-primary-navigation"
                    onClick={toggleMobileMenu}
                >
                    <span className="mobile-menu-text">
                        {isMobileMenuOpen ? "Close" : "Menu"}
                    </span>

                    <span
                        className={`mobile-menu-icon ${isMobileMenuOpen ? "is-open" : ""
                            }`}
                        aria-hidden="true"
                    >
                        <span />
                        <span />
                        <span />
                    </span>
                </button>
            )}

            <div
                id="finsight-primary-navigation"
                className="navbar-links"
            >
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

                {isAuthenticated &&
                    hasRole(["Admin", "Auditor", "Analyst"]) && (
                        <NavLink to="/accounts" className={getNavClass}>
                            Accounts
                        </NavLink>
                    )}

                {isAuthenticated && hasRole(["Admin", "Analyst"]) && (
                    <NavLink
                        to="/transactions"
                        className={getNavClass}
                    >
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

                {isAuthenticated && hasRole(["Admin", "Auditor"]) && (
                    <NavLink
                        to="/ingestion-engine"
                        className={getNavClass}
                    >
                        Ingestion Engine
                    </NavLink>
                )}

                {isAuthenticated &&
                    hasRole(["Admin", "Auditor", "Analyst"]) && (
                        <NavLink to="/ml-ai" className={getNavClass}>
                            ML / AI
                        </NavLink>
                    )}

                {!isAuthenticated && (
                    <NavLink to="/login" className={getNavClass}>
                        Login
                    </NavLink>
                )}
            </div>

            <div className="navbar-actions">
                {isAuthenticated && (
                    <>
                        <span className="role-badge">
                            {role ?? "User"}
                        </span>

                        <button
                            type="button"
                            className="button secondary-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}