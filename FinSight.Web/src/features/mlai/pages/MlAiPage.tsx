import React from "react";
import {
    generateEnterpriseInsight,
    scoreTransactionRisk
} from "../api/mlAiApi";
import type {
    EnterpriseAiInsightResponse,
    TransactionRiskPredictionResponse
} from "../types/mlAiTypes";

export function MlAiPage() {
    const [amount, setAmount] = React.useState("12500");
    const [transactionType, setTransactionType] = React.useState("TransferOut");
    const [description, setDescription] = React.useState("Urgent offshore wire transfer");
    const [customerRiskRating, setCustomerRiskRating] = React.useState("High");

    const [scenario, setScenario] = React.useState(
        "A high-value outbound transaction was flagged for review."
    );
    const [question, setQuestion] = React.useState(
        "What should an analyst review before approving this activity?"
    );
    const [signals, setSignals] = React.useState(
        "High-value amount, outbound transfer, elevated customer risk, urgent wording"
    );

    const [riskResult, setRiskResult] =
        React.useState<TransactionRiskPredictionResponse | null>(null);

    const [insightResult, setInsightResult] =
        React.useState<EnterpriseAiInsightResponse | null>(null);

    const [loadingRisk, setLoadingRisk] = React.useState(false);
    const [loadingInsight, setLoadingInsight] = React.useState(false);
    const [error, setError] = React.useState("");

    async function handleScoreRisk() {
        try {
            setLoadingRisk(true);
            setError("");

            const result = await scoreTransactionRisk({
                amount: Number(amount),
                transactionType,
                description,
                customerRiskRating,
                transactionDate: new Date().toISOString()
            });

            setRiskResult(result);
        } catch (err) {
            console.error("Failed to score transaction risk:", err);
            setError("Failed to score transaction risk.");
        } finally {
            setLoadingRisk(false);
        }
    }

    async function handleGenerateInsight() {
        try {
            setLoadingInsight(true);
            setError("");

            const result = await generateEnterpriseInsight({
                businessArea: "Transactions",
                scenario,
                userQuestion: question,
                dataSignals: signals
                    .split(",")
                    .map((signal) => signal.trim())
                    .filter(Boolean)
            });

            setInsightResult(result);
        } catch (err) {
            console.error("Failed to generate enterprise insight:", err);
            setError("Failed to generate enterprise insight.");
        } finally {
            setLoadingInsight(false);
        }
    }

    return (
        <main className="page">
            <div className="page-header">
                <h1>ML / AI Risk Platform</h1>
                <p>
                    Enterprise-style transaction risk scoring and AI-assisted
                    operational insight review with human-in-the-loop guardrails.
                </p>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="cards ml-ai-grid">
                <section className="card">
                    <h2>Transaction Risk Scoring</h2>
                    <p>
                        Demonstrates a safe ML service boundary for fraud, risk,
                        and analyst-review workflows.
                    </p>

                    <div className="form">
                        <label>
                            Amount
                            <input
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                            />
                        </label>

                        <label>
                            Transaction Type
                            <select
                                value={transactionType}
                                onChange={(event) => setTransactionType(event.target.value)}
                            >
                                <option value="Deposit">Deposit</option>
                                <option value="Withdrawal">Withdrawal</option>
                                <option value="TransferIn">Transfer In</option>
                                <option value="TransferOut">Transfer Out</option>
                            </select>
                        </label>

                        <label>
                            Description
                            <input
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </label>

                        <label>
                            Customer Risk Rating
                            <select
                                value={customerRiskRating}
                                onChange={(event) => setCustomerRiskRating(event.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={handleScoreRisk}
                            disabled={loadingRisk}
                        >
                            {loadingRisk ? "Scoring..." : "Score Risk"}
                        </button>
                    </div>

                    {riskResult && (
                        <div className="dashboard-section">
                            <div className="card">
                                <h2>{riskResult.riskLevel}</h2>
                                <p>Risk Score: {riskResult.riskScore}</p>
                                <p>
                                    Requires Review:{" "}
                                    {riskResult.requiresReview ? "Yes" : "No"}
                                </p>
                                <p>Model Version: {riskResult.modelVersion}</p>

                                <strong>Reasons</strong>
                                <ul>
                                    {riskResult.reasons.map((reason) => (
                                        <li key={reason}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </section>

                <section className="card">
                    <h2>AI-Assisted Enterprise Insight</h2>
                    <p>
                        Demonstrates guardrailed AI assistance for analyst support,
                        documentation, and operational troubleshooting.
                    </p>

                    <div className="form">
                        <label>
                            Scenario
                            <input
                                value={scenario}
                                onChange={(event) => setScenario(event.target.value)}
                            />
                        </label>

                        <label>
                            User Question
                            <input
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                            />
                        </label>

                        <label>
                            Data Signals
                            <input
                                value={signals}
                                onChange={(event) => setSignals(event.target.value)}
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleGenerateInsight}
                            disabled={loadingInsight}
                        >
                            {loadingInsight ? "Generating..." : "Generate Insight"}
                        </button>
                    </div>

                    {insightResult && (
                        <div className="dashboard-section">
                            <div className="card">
                                <h2>Insight</h2>
                                <p>{insightResult.summary}</p>
                                <p>Confidence: {insightResult.confidenceLevel}</p>

                                <strong>Recommended Actions</strong>
                                <ul>
                                    {insightResult.recommendedActions.map((action) => (
                                        <li key={action}>{action}</li>
                                    ))}
                                </ul>

                                <strong>Guardrails Applied</strong>
                                <ul>
                                    {insightResult.guardrailsApplied.map((guardrail) => (
                                        <li key={guardrail}>{guardrail}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
