export function DashboardPage() {
  return (
    <main className="page">
      <div className="page-header">
        <h1>FinSight</h1>
        <p>
          Enterprise banking demo with customers, accounts, transactions,
          loan workflows, JWT authentication, audit logging, and future
          Azure Databricks reporting.
        </p>
      </div>

      <section className="cards">
        <div className="card">
          <h2>Customers</h2>
          <p>Manage customer profiles and banking relationships.</p>
        </div>

        <div className="card">
          <h2>Accounts</h2>
          <p>View account balances and customer account details.</p>
        </div>

        <div className="card">
          <h2>Transactions</h2>
          <p>Track deposits, withdrawals, transfers, and history.</p>
        </div>

        <div className="card">
          <h2>Analytics</h2>
          <p>Future Azure Databricks reporting and financial insights.</p>
        </div>
      </section>
    </main>
  );
}