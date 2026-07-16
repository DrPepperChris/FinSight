import React from "react";
import {
    chatWithAgent,
    exportAgentDocumentDocx,
    uploadAgentFile
} from "../api/mlAiApi";
import type {
    AgentChatResponse,
    AgentUploadedFileResponse
} from "../types/mlAiTypes";

interface AgentMessage {
    id: string;
    role: "user" | "agent" | "system";
    text: string;
    response?: AgentChatResponse;
    upload?: AgentUploadedFileResponse;
}

function createMessageId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ListBlock({ title, items }: { title: string; items?: string[] }) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="ml-ai-result-block">
            <strong>{title}</strong>
            <ul>
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function UploadStatusCard({ upload }: { upload: AgentUploadedFileResponse }) {
    return (
        <div className="ml-ai-upload-card">
            <div className="ml-ai-upload-header">
                <strong>{upload.originalFileName}</strong>
                <span>{upload.uploadStatus}</span>
            </div>

            <div className="ml-ai-meta-grid">
                <div className="ml-ai-meta-item">
                    <span>Pipeline Layer</span>
                    <strong>{upload.pipelineLayer}</strong>
                </div>
                <div className="ml-ai-meta-item">
                    <span>Scan Status</span>
                    <strong>{upload.scanResult.scanStatus}</strong>
                </div>
                <div className="ml-ai-meta-item">
                    <span>Requires Review</span>
                    <strong>{upload.scanResult.requiresReview ? "Yes" : "No"}</strong>
                </div>
                <div className="ml-ai-meta-item">
                    <span>File Size</span>
                    <strong>{upload.fileSizeBytes} bytes</strong>
                </div>
            </div>

            <ListBlock title="Scan Findings" items={upload.scanResult.findings} />
            <ListBlock title="Pipeline Stages" items={upload.pipelineStages} />
            <ListBlock title="Upload Guardrails" items={upload.scanResult.guardrailsApplied} />
        </div>
    );
}

function AgentResponseCard({ response }: { response: AgentChatResponse }) {
    async function downloadDocx() {
        if (!response.proposedMarkdown) {
            alert("No proposed markdown found to export.");
            return;
        }

        try {
            const blob = await exportAgentDocumentDocx({
                fileName: "finsight-company-standard-draft.docx",
                title: "FinSight Company Standard Draft",
                markdown: response.proposedMarkdown
            });

            const docxBlob = new Blob([blob], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });

            const url = URL.createObjectURL(docxBlob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "finsight-company-standard-draft.docx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("DOCX export failed:", err);
            alert("DOCX export failed. Check the browser console and API terminal for the exact error.");
        }
    }

    function downloadMarkdown() {
        const blob = new Blob([response.proposedMarkdown ?? ""], {
            type: "text/markdown;charset=utf-8"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "finsight-company-standard-draft.md";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    return (
        <div className="ml-ai-agent-response-card">
            <div className="ml-ai-response-header">
                <strong>{response.responseType}</strong>
                <span>{new Date(response.generatedAtUtc).toLocaleString()}</span>
            </div>

            <p>{response.answer}</p>

            <ListBlock title="Recommended Actions" items={response.recommendedActions} />
            <ListBlock title="Pipeline Stages" items={response.pipelineStages} />
            <ListBlock title="Guardrails Applied" items={response.guardrailsApplied} />
            <ListBlock title="Files Considered" items={response.filesConsidered} />
            <ListBlock title="Proposed Files" items={response.proposedFiles} />
            <ListBlock title="Implementation Steps" items={response.implementationSteps} />

            {response.proposedMarkdown && (
                <div className="ml-ai-document-output">
                    <div className="ml-ai-document-actions">
                        <strong>Proposed Document Draft</strong>

                        <div>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        response.proposedMarkdown ?? ""
                                    )
                                }
                            >
                                Copy Markdown
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={downloadMarkdown}
                            >
                                Download Draft
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={downloadDocx}
                            >
                                Download DOCX
                            </button>
                        </div>
                    </div>

                    <pre className="json-preview">{response.proposedMarkdown}</pre>
                </div>
            )}
        </div>
    );
}

export function MlAiPage() {
    const initialSystemMessage: AgentMessage = {
        id: createMessageId(),
        role: "system",
        text:
            "FinSight AI Agent is ready. Upload files, ask for feature plans, documentation proposals, codebase-aware recommendations, or company standards. Uploads are scanned before they are used."
    };

    const [message, setMessage] = React.useState(
        "Build a FinSight AI agent that lets employees upload code files, screenshots, and documents. Scan uploads, run them through Bronze Silver Gold ETL, and generate company standards for review."
    );
    const [uploadedFiles, setUploadedFiles] = React.useState<AgentUploadedFileResponse[]>([]);
    const [messages, setMessages] = React.useState<AgentMessage[]>([
        initialSystemMessage
    ]);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isSending, setIsSending] = React.useState(false);
    const [error, setError] = React.useState("");

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            setIsUploading(true);
            setError("");

            const uploadResult = await uploadAgentFile(file);

            setUploadedFiles((current) => [...current, uploadResult]);

            setMessages((current) => [
                ...current,
                {
                    id: createMessageId(),
                    role: "system",
                    text: `Uploaded ${uploadResult.originalFileName}. Scan status: ${uploadResult.scanResult.scanStatus}. Pipeline layer: ${uploadResult.pipelineLayer}.`,
                    upload: uploadResult
                }
            ]);

            event.target.value = "";
        } catch (err) {
            console.error(err);
            setError("Upload failed. The file may have been blocked by the demo scanner.");
        } finally {
            setIsUploading(false);
        }
    }

    async function handleSend() {
        const trimmed = message.trim();

        if (!trimmed) {
            return;
        }

        try {
            setIsSending(true);
            setError("");

            const userMessage: AgentMessage = {
                id: createMessageId(),
                role: "user",
                text: trimmed
            };

            setMessages((current) => [...current, userMessage]);

            const response = await chatWithAgent({
                message: trimmed,
                uploadedFileIds: uploadedFiles.map((file) => file.fileId),
                includeCodebaseContext: true,
                generateDocumentationProposal: true,
                generateFeaturePlan: true
            });

            const agentMessage: AgentMessage = {
                id: createMessageId(),
                role: "agent",
                text: response.answer,
                response
            };

            setMessages((current) => [...current, agentMessage]);
            setMessage("");
        } catch (err) {
            console.error(err);
            setError("Agent request failed.");
        } finally {
            setIsSending(false);
        }
    }

    function loadExamplePrompt(prompt: string) {
        setMessage(prompt);
        setError("");
    }

    function clearInput() {
        setMessage("");
        setError("");
    }

    function resetChat() {
        setUploadedFiles([]);
        setError("");
        setMessage("");

        setMessages([
            {
                id: createMessageId(),
                role: "system",
                text:
                    "FinSight AI Agent is ready. Upload files, ask for feature plans, documentation proposals, codebase-aware recommendations, or company standards. Uploads are scanned before they are used."
            }
        ]);
    }

    return (
        <main className="page ml-ai-page">
            <div className="page-header">
                <h1>FinSight AI Agent</h1>
                <p>
                    Chat-style enterprise AI assistant with file upload scanning,
                    Bronze/Silver/Gold pipeline stages, guardrails, and reviewable
                    implementation outputs.
                </p>
            </div>

            <section className="card ml-ai-warning-card">
                <h2>Decision Support Only</h2>
                <p>
                    Uploaded files are scanned before use. Agent responses are reviewable
                    proposals only and do not modify production code, documentation,
                    customer records, transactions, or financial decisions.
                </p>
            </section>

            <section className="ml-ai-workspace">
                <div className="ml-ai-agent-shell">
                    <div className="ml-ai-chat-panel">
                        {messages.map((item) => (
                            <div
                                key={item.id}
                                className={`ml-ai-message ml-ai-message-${item.role}`}
                            >
                                <div className="ml-ai-message-role">
                                    {item.role === "user"
                                        ? "You"
                                        : item.role === "agent"
                                          ? "FinSight Agent"
                                          : "System"}
                                </div>

                                <p>{item.text}</p>

                                {item.upload && <UploadStatusCard upload={item.upload} />}
                                {item.response && <AgentResponseCard response={item.response} />}
                            </div>
                        ))}
                    </div>

                    <aside className="ml-ai-side-panel">
                        <h3>Uploaded Files</h3>

                        {uploadedFiles.length === 0 && <p>No files uploaded yet.</p>}

                        {uploadedFiles.map((file) => (
                            <div key={file.fileId} className="ml-ai-upload-summary">
                                <strong>{file.originalFileName}</strong>
                                <span>{file.uploadStatus}</span>
                                <small>{file.scanResult.scanStatus}</small>
                            </div>
                        ))}

                        <h3>Example Prompts</h3>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                loadExamplePrompt(
                                    "Build a FinSight DOCX-style document that will eventually act as the company standard for all business units going forward. Include a UML diagram that shows connections and dependencies to and from other business logic units, services, controllers, DTOs, React pages, API clients, and database tables if used. Use Customers as the first example. This should remain a draft only until I review and approve it for Gold company knowledge."
                                )
                            }
                        >
                            DOCX Company Standard
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                loadExamplePrompt(
                                    "Use this file as a reference / standard for unit tests. Treat the uploaded file as Bronze input, generate a Silver draft unit testing standard, and require human approval before promoting it to Gold company knowledge."
                                )
                            }
                        >
                            Unit Test Standard
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                loadExamplePrompt(
                                    "Analyze the uploaded files and propose company coding and documentation standards using Bronze Silver Gold ETL."
                                )
                            }
                        >
                            Standards from Uploads
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                loadExamplePrompt(
                                    "Create a reuse-first implementation plan for a new feature using existing controllers, services, DTOs, and React patterns."
                                )
                            }
                        >
                            Reuse-First Feature Plan
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                loadExamplePrompt(
                                    "Generate documentation for this feature using the existing FinSight documentation format and naming conventions."
                                )
                            }
                        >
                            Documentation Proposal
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                loadExamplePrompt(
                                    "Explain how this AI agent should be deployed to Azure using Blob Storage, Azure AI Search, Azure OpenAI, SQL, and Application Insights."
                                )
                            }
                        >
                            Azure Deployment Plan
                        </button>
                    </aside>
                </div>

                {error && <p className="error">{error}</p>}

                <div className="ml-ai-composer">
                    <label className="ml-ai-file-button">
                        {isUploading ? "Uploading..." : "Attach File"}
                        <input
                            type="file"
                            onChange={handleFileChange}
                            disabled={isUploading || isSending}
                        />
                    </label>

                    <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Ask FinSight AI anything..."
                        rows={4}
                    />

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={clearInput}
                        disabled={isSending || isUploading || !message.trim()}
                    >
                        Clear Input
                    </button>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={resetChat}
                        disabled={isSending || isUploading}
                    >
                        Reset Chat
                    </button>

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending || isUploading || !message.trim()}
                    >
                        {isSending ? "Sending..." : "Send"}
                    </button>
                </div>
            </section>
        </main>
    );
}