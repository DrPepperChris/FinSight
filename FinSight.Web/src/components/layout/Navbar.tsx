import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext/AuthContext";

export function Navbar() {
    const { isAuthenticated, logoutUser } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutUser();
        navigate("/login");
    }

    return (
        <nav className="nav">
            {isAuthenticated && <Link to="/">Dashboard</Link>}

            {isAuthenticated && (
                <>
                    <Link to="/customers">Customers</Link>
                    <Link to="/accounts">Accounts</Link>
                    <Link to="/transactions">Transactions</Link>
                    <Link to="/loans">Loans</Link>
                </>
            )}

            {!isAuthenticated && <Link to="/login">Login</Link>}

            {isAuthenticated && (
                <button type="button" className="nav-button" onClick={handleLogout}>
                    Logout
                </button>
            )}
        </nav>
    );
}