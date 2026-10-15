
import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiMode, setAiMode] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const [compareFile, setCompareFile] = useState(null);

  async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof result.detail === "string"
          ? result.detail
          : "The request failed. Please try again."
      );
    }

    return result;
  }

  function clearAiResult() {
    setAiResult("");
    setAiError("");
    setAiMode("");
  }

  async function uploadDocument(event) {
    event.preventDefault();

    if (!file) {
      setError("Please choose a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setDocument(null);
    clearAiResult();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await requestJson(
        `${API_URL}/api/documents/extract`,
        {
          method: "POST",
          body: formData,
        }
      );

      setDocument(result);
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Check that it is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAiAction(mode) {
    if (!document?.text?.trim()) {
      setAiError("Upload a document containing readable text first.");
      return;
    }

    if (document.text.length > 60000) {
      setAiError(
        "This document exceeds the AI text limit of 60,000 characters. Use a shorter document."
      );
      return;
    }

    if (mode === "chat" && !question.trim()) {
      setAiError("Enter a question about your document.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResult("");
    setAiMode(mode);

    const requests = {
      summarize: {
        url: "/api/ai/summarize",
        body: { text: document.text },
        field: "summary",
      },
      extract: {
        url: "/api/ai/extract",
        body: { text: document.text },
        field: "extracted_information",
      },
      chat: {
        url: "/api/ai/chat",
        body: {
          text: document.text,
          question: question.trim(),
        },
        field: "answer",
      },
    };

    try {
      const action = requests[mode];

      const result = await requestJson(
        `${API_URL}${action.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(action.body),
        }
      );

      
const responseText =
  result[action.field] || "The AI returned no result.";

setAiResult(responseText);

if (action.field === "answer") {
  setChatHistory((previous) => [
    ...previous,
    {
      question,
      answer: responseText,
    },
  ]);
}

    } catch (err) {
      setAiError(
        err.message || "The AI request failed. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function compareDocuments() {
    if (!document?.text?.trim()) {
      setAiError("Upload the first document before comparing.");
      return;
    }

    if (!compareFile) {
      setAiError("Choose a second document to compare.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResult("");
    setAiMode("compare");

    try {
      const formData = new FormData();
      formData.append("file", compareFile);

      const secondDocument = await requestJson(
        `${API_URL}/api/documents/extract`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!secondDocument.text?.trim()) {
        throw new Error(
          "The second document contains no readable text."
        );
      }

      if (
        document.text.length > 40000 ||
        secondDocument.text.length > 40000
      ) {
        throw new Error(
          "Each document must contain no more than 40,000 characters for comparison."
        );
      }

      const result = await requestJson(
        `${API_URL}/api/ai/compare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_a: document.text,
            document_b: secondDocument.text,
          }),
        }
      );

      setAiResult(
        result.comparison || "The AI returned no comparison."
      );
    } catch (err) {
      setAiError(
        err.message || "Document comparison failed."
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand-icon">DA</div>
        <div>
          <h1>Personal Document Analyzer</h1>
          <p>Your documents, easier to understand.</p>
        </div>
      </header>

      <section className="hero">
        <span className="eyebrow">AI DOCUMENT INTELLIGENCE</span>
        <h2>Understand any document.</h2>
        <p>
          Upload a PDF, Word document, or text file to extract
          its contents. Summarize, analyze, ask questions, and
          compare documents using AI. Scanned PDFs can use OCR.
        </p>
      </section>

      <section className="panel">
        <h3>Upload a document</h3>

        <form onSubmit={uploadDocument}>
          <label className="dropzone">
            <span className="upload-icon">↑</span>
            <strong>
              {file ? file.name : "Choose a document"}
            </strong>
            <span>PDF, DOCX, or TXT · Maximum 10 MB</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setDocument(null);
                setError("");
                setQuestion("");
                setCompareFile(null);
                clearAiResult();
              }}
            />
          </label>

          <button type="submit" disabled={loading || !file}>
            {loading ? "Processing document..." : "Upload and extract"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
      </section>

      {document && (
        <>
          <section className="panel results">
            <div className="result-heading">
              <div>
                <span className="eyebrow">EXTRACTION RESULT</span>
                <h3>{document.filename}</h3>
              </div>
              <span className="file-type">{document.file_type}</span>
            </div>

            <div className="stats">
              <div>
                <strong>
                  {document.characters.toLocaleString()}
                </strong>
                <span>Characters</span>
              </div>
              <div>
                <strong>{document.pages?.length || "—"}</strong>
                <span>Pages</span>
              </div>
              <div>
                <strong>{document.ocr_pages?.length || 0}</strong>
                <span>OCR pages</span>
              </div>
            </div>

            {document.ocr_pages?.length > 0 && (
              <p className="notice">
                OCR used on page(s): {document.ocr_pages.join(", ")}
              </p>
            )}

            <h4>Extracted text</h4>
            <pre className="document-text">{document.text}</pre>
          </section>

          <section className="panel">
            <span className="eyebrow">GEMINI AI</span>
            <h3>Analyze your document</h3>
            <p>
              Choose an action to analyze the extracted text.
            </p>

            <div className="ai-actions">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => runAiAction("summarize")}
              >
                Summarize
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => runAiAction("extract")}
              >
                Extract information
              </button>
            </div>

            <div className="ai-chat">
              <h4>Ask a question</h4>
              <label htmlFor="document-question">
                Your question
              </label>
              <textarea
                id="document-question"
                rows={3}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: What are the main points in this document?"
                disabled={aiLoading}
              />

              <button
                type="button"
                disabled={aiLoading || !question.trim()}
                onClick={() => runAiAction("chat")}
              >
                Ask AI
              </button>
            </div>

            <div className="ai-compare">
              <h4>Compare with another document</h4>
              <p>
                Select a second PDF, DOCX, or TXT file to compare
                its contents with the first document.
              </p>

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                disabled={aiLoading}
                onChange={(event) => {
                  setCompareFile(event.target.files?.[0] || null);
                  setAiError("");
                  if (aiMode === "compare") {
                    setAiResult("");
                    setAiMode("");
                  }
                }}
              />

              <button
                type="button"
                disabled={aiLoading || !compareFile}
                onClick={compareDocuments}
              >
                Compare documents
              </button>
            </div>

            {aiLoading && (
              <p role="status" className="notice">
                AI is processing your request. Please wait...
              </p>
            )}

            {aiError && (
              <div className="error" role="alert">
                {aiError}
              </div>
            )}

            {aiResult && (
              <section className="ai-result" aria-live="polite">
                <h4>
                  {aiMode === "summarize" && "Document summary"}
                  {aiMode === "extract" && "Extracted information"}
                  {aiMode === "chat" && "AI answer"}
                  {aiMode === "compare" && "Document comparison"}
                </h4>
               
<pre className="document-text">{aiResult}</pre>
<div className="result-actions">
  <button
    type="button"
    onClick={() => {
      const blob = new Blob([aiResult], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      const filename =
        {
          summarize: "document-summary.txt",
          extract: "extracted-information.txt",
          chat: "ai-answer.txt",
          compare: "document-comparison.txt",
        }[aiMode] || "ai-result.txt";

      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }}
  >
    Download Result (.txt)
  </button>

  <button
    type="button"
    onClick={() => {
      setAiResult("");
      setAiError("");
      setAiMode("");
    }}
  >
    Clear result
  </button>
</div>

              </section>
            )}
          </section>
        </>
      )}
      
{chatHistory.length > 0 && (
  <section className="ai-result">
    <h4>Chat History</h4>

    {chatHistory.map((chat, index) => (
      <div key={index} className="chat-history-item">
        <p>
          <strong>Question {index + 1}:</strong>{" "}
          {chat.question}
        </p>

        <p>
          <strong>AI Answer:</strong>
        </p>

        <pre className="document-text">{chat.answer}</pre>
      </div>
    ))}

    <button
      type="button"
      onClick={() => setChatHistory([])}
    >
      Clear Chat History
    </button>
  </section>
)}


      <footer>
        AI Personal Document Analyzer · Local development
      </footer>
    </main>
  );
}
