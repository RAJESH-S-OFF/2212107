import React, { useState, useEffect } from "react";
const generateCode = () => Math.random().toString(36).substring(2, 8);

const App = () => {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortLinks, setShortLinks] = useState(
    JSON.parse(localStorage.getItem("shortLinks")) || {}
  );
  const [logs, setLogs] = useState(
    JSON.parse(localStorage.getItem("logs")) || []
  );
  const [message, setMessage] = useState("");
  useEffect(() => {
    localStorage.setItem("shortLinks", JSON.stringify(shortLinks));
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [shortLinks, logs]);

  const logAction = (text) => {
    const entry = `[${new Date().toLocaleString()}] ${text}`;
    setLogs((prev) => [...prev, entry]);
  };

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      setLoggedIn(true);
      localStorage.setItem("loggedIn", "true");
      logAction("User logged in");
    } else {
      setMessage("Invalid credentials (try admin / 1234)");
      logAction("Failed login attempt");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.setItem("loggedIn", "false");
    logAction("User logged out");
  };
  const shortenUrl = () => {
    if (!url.startsWith("http")) {
      setMessage(" Invalid URL. Must start with http/https.");
      logAction("Error: Invalid URL entered");
      return;
    }
    let code = customCode || generateCode();
    if (shortLinks[code]) {
      setMessage(" Shortcode already taken.");
      logAction("Error: Duplicate shortcode");
      return;
    }
    const expiry = Date.now()+7*24*60*60*1000; 
    const newLinks = {
      ...shortLinks,
      [code]: { original: url, expiry },
    };
    setShortLinks(newLinks);
    setMessage(` Short link created: ${window.location.origin}/#/${code}`);
    logAction(`Shortened ${url} -> ${code}`);
    setUrl("");
    setCustomCode("");
  };
  const RedirectPage = () => {
    const code = window.location.hash.replace("#/", "");
    if (code) {
      const entry = shortLinks[code];
      if (entry) {
        if (Date.now() > entry.expiry) {
          return <h2> Link expired.</h2>;
        }
        window.location.href = entry.original;
      } else {
        return <h2> Link not found.</h2>;
      }
    }
    return null;
  };
  if (window.location.hash.startsWith("#/")) {
    return <RedirectPage />;
  }
  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1> React URL Shortener</h1>
      {!loggedIn ? (
        <div>
          <h3>Login</h3>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleLogin}>Login</button>
          <p style={{ color: "red" }}>{message}</p>
        </div>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <h3>Enter URL to shorten</h3>
          <input
            type="text"
            value={url}
            placeholder="https://example.com"
            onChange={(e) => setUrl(e.target.value)}
          />
          <br />
          <input
            type="text"
            value={customCode}
            placeholder="Custom shortcode (optional)"
            onChange={(e) => setCustomCode(e.target.value)}
          />
          <br />
          <button onClick={shortenUrl}>Shorten</button>
          <p>{message}</p>

          <h3>Logs</h3>
          <ul>
            {logs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>

          <h3>Existing Links</h3>
          <ul>
            {Object.entries(shortLinks).map(([code, info]) => (
              <li key={code}>
                <b>{code}</b> → {info.original} (expires:{" "}
                {new Date(info.expiry).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default App;
