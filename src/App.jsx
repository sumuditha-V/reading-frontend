import { useEffect, useState } from "react";

const localApiUrl = "http://localhost:5000/api/reading";
const deployedApiUrl = "";

const resolvedApiUrl =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? localApiUrl : deployedApiUrl);

export default function App() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!resolvedApiUrl) {
      setError(
        "API URL is not configured. Set VITE_API_URL to your deployed backend before building the frontend."
      );
      return;
    }

    async function loadReadingList() {
      try {
        const response = await fetch(resolvedApiUrl);
        if (!response.ok) throw new Error("Failed to load reading list.");
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadReadingList();
  }, []);

  function toggleReadState(itemId) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, isRead: !item.isRead } : item
      )
    );
  }

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  }

  function resetAll() {
    setItems((current) => current.map((item) => ({ ...item, isRead: false })));
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems =
    normalizedQuery.length === 0
      ? items
      : items.filter((i) => i.title.toLowerCase().includes(normalizedQuery));

  const total = items.length;
  const readCount = items.filter((i) => i.isRead).length;
  const percent = total === 0 ? 0 : Math.round((readCount / total) * 100);

  return (
    <main className="rt-shell">
      <div className="rt-bg" aria-hidden="true" />
      <div className="rt-container">
        <header className="rt-header">
          <div className="rt-brand">
            <div className="rt-brandTop">Reading Tracker</div>
            <div className="rt-brandBottom">React UI + .NET minimal API</div>
          </div>
          <div className="rt-badges">
            <span className="rt-badge rt-badge--primary">{percent}% complete</span>
            <span className="rt-badge">{readCount}/{total} read</span>
          </div>
        </header>

        <section className="rt-grid">
          <section className="rt-panel rt-panel--summary">
            <h2 className="rt-h2">Today’s progress</h2>
            <div className="rt-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="rt-progressFill" style={{ width: `${percent}%` }} />
            </div>

            <div className="rt-stats">
              <div className="rt-stat">
                <div className="rt-statNum">{readCount}</div>
                <div className="rt-statLabel">Read</div>
              </div>
              <div className="rt-stat">
                <div className="rt-statNum">{total - readCount}</div>
                <div className="rt-statLabel">Unread</div>
              </div>
            </div>

            <div className="rt-actions">
              <button type="button" className="rt-btn rt-btn--primary" onClick={markAllRead}>
                Mark all as read
              </button>
              <button type="button" className="rt-btn rt-btn--ghost" onClick={resetAll}>
                Reset
              </button>
            </div>

            {error ? <div className="rt-alert">{error}</div> : null}
          </section>

          <section className="rt-panel">
            <div className="rt-toolbar">
              <label className="rt-field">
                <span className="rt-label">Search</span>
                <input
                  className="rt-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a book title..."
                />
              </label>
            </div>

            <ul className="rt-list">
              {filteredItems.map((item) => (
                <li key={item.id} className="rt-item">
                  <div className="rt-itemMain">
                    <div className="rt-itemTitle">{item.title}</div>
                    <div className="rt-itemMeta">
                      <span
                        className={
                          item.isRead ? "rt-pill rt-pill--read" : "rt-pill rt-pill--unread"
                        }
                      >
                        {item.isRead ? "Read" : "Unread"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={item.isRead ? "rt-btn rt-btn--danger" : "rt-btn rt-btn--primary"}
                    onClick={() => toggleReadState(item.id)}
                  >
                    {item.isRead ? "Mark unread" : "Mark read"}
                  </button>
                </li>
              ))}
            </ul>

            {filteredItems.length === 0 ? (
              <p className="rt-empty">No matching books. Try a different search.</p>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}
