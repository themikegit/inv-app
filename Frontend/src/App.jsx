import { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    // Test API connection
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        setApiStatus("Connected ✓");
        setApiData(data);
      })
      .catch((err) => {
        setApiStatus("Error: " + err.message);
      });
  }, []);

  return (
    <>
      <div>
        <h1>Invoice Management App</h1>
        <p>Frontend: React + Vite</p>
        <p>Backend: FastAPI</p>
      </div>
      <div className="card">
        <h2>API Status: {apiStatus}</h2>
        {apiData && (
          <div>
            <p>
              <strong>Message:</strong> {apiData.message}
            </p>
            <p>
              <strong>Version:</strong> {apiData.version}
            </p>
            <p>
              <strong>API URL:</strong>{" "}
              <a
                href={`${API_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {API_URL}/docs
              </a>
            </p>
          </div>
        )}
      </div>
      <p className="read-the-docs">
        Start building your invoice management interface here!
      </p>
    </>
  );
}

export default App;
