// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Layout from "./Layout/Layout";
import "./index.css";

// Placeholder pages
const Results = () => <h2>Results Page</h2>;
const Constituencies = () => <h2>Constituencies Page</h2>;
const Parties = () => <h2>Parties Page</h2>;
const Candidates = () => <h2>Candidates Page</h2>;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="results" element={<Results />} />
          <Route path="constituencies" element={<Constituencies />} />
          <Route path="parties" element={<Parties />} />
          <Route path="candidates" element={<Candidates />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
