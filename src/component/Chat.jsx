import { useState, useRef, useEffect } from "react";
import "./Chat.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/chat";

function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async (text = question) => {
    const userQuestion = text.trim();

    if (!userQuestion || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "No answer received.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't connect to the AI service. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([]);
    setQuestion("");
  };

  return (
    <div className="app-shell">
      <main className="chat-app">
        {/* Header */}
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">R</div>
            <div>
              <h1>RAG Assistant</h1>
              <span>Intelligent document search</span>
            </div>
          </div>

          <div className="topbar-right">
            <span className="document-badge">
              <span className="status-dot"></span>
              Connected PDF
            </span>

            <button
              className="clear-button"
              onClick={clearChat}
              disabled={loading || messages.length === 0}
            >
              New chat
            </button>
          </div>
        </header>

        {/* Chat body */}
        <section className="chat-body">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">AI</div>

              <span className="eyebrow">YOUR DOCUMENT ASSISTANT</span>

              <h2>
                Ask anything about
                <br />
                <span>your document records.</span>
              </h2>

              <p className="welcome-description">
                Search employee attendance, leave records, and daily work details using natural language.
              </p>

              <div className="suggestion-section">
                <div className="suggestion-heading">
                  <span>TRY ASKING</span>
                  <span>Suggested questions</span>
                </div>

                <div className="suggestions-grid" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                  {[
                    "How many leaves did Rahul take?",
                    "What was the total working hours logged?",
                    "List all employees in the records",
                  ].map((suggested, idx) => (
                    <button
                      key={idx}
                      className="clear-button"
                      style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                      onClick={() => sendMessage(suggested)}
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message-row ${message.role}`}
                >
                  <div className="avatar">
                    {message.role === "user" ? "Y" : "AI"}
                  </div>

                  <div className="message-wrapper">
                    <div className="message-author">
                      {message.role === "user" ? "You" : "RAG Assistant"}
                    </div>

                    <div className="message-bubble">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message-row assistant">
                  <div className="avatar">AI</div>
                  <div className="message-wrapper">
                    <div className="message-author">
                      RAG Assistant
                    </div>
                    <div className="message-bubble typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {/* Input */}
        <footer className="chat-footer">
          <form
            className="input-container"
            onSubmit={handleSubmit}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about employees, leave or timesheets..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="send-button"
              disabled={loading || !question.trim()}
            >
              Send
              <span>↑</span>
            </button>
          </form>

          <p className="footer-note">
            AI responses are generated from the connected PDF knowledge base.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default Chat;
