import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext/AuthContext";

export function Navbar() {
    const { isAuthenticated, logoutUser } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutUser();
        navigate("/login");
    }

    function getNavClass({ isActive }: { isActive: boolean }) {
        return isActive ? "nav-link active-nav-link" : "nav-link";
    }

    return (
        <nav className="nav">
            <div className="nav-brand">FinSight</div>

            <div className="nav-links">
                {isAuthenticated && (
                    <>
                        <NavLink to="/" className={getNavClass} end>
                            Dashboard
                        </NavLink>

                        <NavLink to="/customers" className={getNavClass}>
                            Customers
                        </NavLink>

                        <NavLink to="/accounts" className={getNavClass}>
                            Accounts
                        </NavLink>

                        <NavLink to="/transactions" className={getNavClass}>
                            Transactions
                        </NavLink>

                        <NavLink to="/loans" className={getNavClass}>
                            Loans
                        </NavLink>
                    </>
                )}

                {!isAuthenticated && (
                    <NavLink to="/login" className={getNavClass}>
                        Login
                    </NavLink>
                )}
            </div>

            {isAuthenticated && (
                <button type="button" className="nav-button" onClick={handleLogout}>
                    Logout
                </button>
            )}
        </nav>
    );
}