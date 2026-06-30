import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="nav">
      <Link to="/">Dashboard</Link>
      <Link to="/login">Login</Link>
      <Link to="/customers">Customers</Link>
      <Link to="/accounts">Accounts</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/loans">Loans</Link>
    </nav>
  );
}