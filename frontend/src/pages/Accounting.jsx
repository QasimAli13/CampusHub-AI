import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_BASE = "https://campushub-ai-i7y8.onrender.com/api";

export default function Accounting() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Expense",
    category: "Staff Salary",
    amount: "",
    paymentMethod: "Bank Transfer",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // Get authentication token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch transactions and summary
  const fetchAccountingData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const [txnRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/accounting`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),

        fetch(`${API_BASE}/accounting/summary`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
      ]);

      const txnData = await txnRes.json();
      const summaryData = await summaryRes.json();

      if (txnRes.ok && txnData.success) {
        setTransactions(txnData.data || []);
      } else {
        toast.error(txnData.message || "Failed to load transactions");
      }

      if (summaryRes.ok && summaryData.success) {
        setSummary(summaryData.data || null);
      } else {
        toast.error(summaryData.message || "Failed to load accounting summary");
      }
    } catch (error) {
      console.error("Accounting error:", error);
      toast.error("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountingData();
  }, []);

  // Submit new transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE}/accounting`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Transaction logged successfully!");

        setShowModal(false);

        setFormData({
          title: "",
          type: "Expense",
          category: "Staff Salary",
          amount: "",
          paymentMethod: "Bank Transfer",
          date: new Date().toISOString().split("T")[0],
          remarks: "",
        });

        await fetchAccountingData();
      } else {
        toast.error(data.message || "Failed to record transaction");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Server connection error");
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      typeFilter === "All" || t.type === typeFilter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      t.title?.toLowerCase().includes(searchText) ||
      t.category?.toLowerCase().includes(searchText) ||
      t.referenceNo?.toLowerCase().includes(searchText);

    return matchesType && matchesSearch;
  });

  return (
    <div className="accounting-page">

      {/* Top Header */}
      <div className="accounting-header">
        <div className="header-left">
          <div className="header-icon-box"></div>

          <div>
            <h1 className="accounting-title">
              Accounts & Financial Ledger
            </h1>

            <p className="accounting-subtitle">
              Monitor institutional revenues, operational expenditures,
              and campus cashflow.
            </p>
          </div>
        </div>

        <button
          className="btn-log-txn"
          onClick={() => setShowModal(true)}
        >
          + Record Voucher
        </button>
      </div>

      {/* Summary Metrics */}
      {summary && (
        <div className="accounting-summary-grid">

          <div className="accounting-card">
            <span className="card-label">
              Total Revenue (Inflow)
            </span>

            <h3 className="card-value income">
              ${Number(summary.totalIncome || 0).toLocaleString()}
            </h3>

            <span className="card-subtext">
              Fees, grants, and campus receipts
            </span>
          </div>

          <div className="accounting-card">
            <span className="card-label">
              Total Expenses (Outflow)
            </span>

            <h3 className="card-value expense">
              ${Number(summary.totalExpense || 0).toLocaleString()}
            </h3>

            <span className="card-subtext">
              Payroll, utilities, and procurement
            </span>
          </div>

          <div className="accounting-card">
            <span className="card-label">
              Operating Balance
            </span>

            <h3
              className={`card-value ${
                Number(summary.netBalance || 0) >= 0
                  ? "income"
                  : "expense"
              }`}
            >
              ${Number(summary.netBalance || 0).toLocaleString()}
            </h3>

            <span className="card-subtext">
              Net reserves across institutional accounts
            </span>
          </div>

        </div>
      )}

      {/* Search and Filters */}
      <div className="accounting-controls-row">

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, category, or voucher reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {["All", "Income", "Expense"].map((type) => (
            <button
              key={type}
              type="button"
              className={`pill-btn ${
                typeFilter === type ? "active" : ""
              }`}
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>

      </div>

      {/* Transactions Table */}
      <div className="accounting-table-card">

        <table className="accounting-table">

          <thead>
            <tr>
              <th>Ref No</th>
              <th>Description / Title</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="7" className="table-empty-msg">
                  Loading financial records...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-msg">
                  No financial transactions found. Click "+ Record Voucher"
                  to log one.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t._id}>

                  <td className="cell-ref">
                    {t.referenceNo}
                  </td>

                  <td>
                    <div className="cell-title">
                      {t.title}
                    </div>

                    {t.remarks && (
                      <div className="cell-sub">
                        {t.remarks}
                      </div>
                    )}
                  </td>

                  <td>
                    <span className="category-badge">
                      {t.category}
                    </span>
                  </td>

                  <td className="cell-mode">
                    {t.paymentMethod}
                  </td>

                  <td className="cell-date">
                    {new Date(t.date).toLocaleDateString()}
                  </td>

                  <td>
                    <span
                      className={`type-badge ${t.type.toLowerCase()}`}
                    >
                      {t.type}
                    </span>
                  </td>

                  <td
                    className={`cell-amount ${t.type.toLowerCase()}`}
                  >
                    {t.type === "Income" ? "+" : "-"}$
                    {Number(t.amount).toLocaleString()}
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* Record Voucher Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >

            <h3 className="modal-title">
              Record Financial Entry
            </h3>

            <form
              onSubmit={handleSubmit}
              className="accounting-form"
            >

              <div className="form-item">
                <label>Voucher Description *</label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Faculty Payroll August 2026"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-row">

                <div className="form-item">
                  <label>Transaction Type *</label>

                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="Expense">
                      Expense (Outflow)
                    </option>

                    <option value="Income">
                      Income (Inflow)
                    </option>
                  </select>
                </div>

                <div className="form-item">
                  <label>Category *</label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="Staff Salary">
                      Staff / Faculty Salary
                    </option>

                    <option value="Fee Collection">
                      Fee Collection
                    </option>

                    <option value="Utility Bills">
                      Utility Bills
                    </option>

                    <option value="Lab & Equipment">
                      Lab & Equipment
                    </option>

                    <option value="Campus Maintenance">
                      Campus Maintenance
                    </option>

                    <option value="Events & Sports">
                      Events & Sports
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-row">

                <div className="form-item">
                  <label>Amount ($) *</label>

                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 5000"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-item">
                  <label>Payment Method</label>

                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Online Gateway">
                      Online Gateway
                    </option>

                    <option value="Cheque">
                      Cheque
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-item">
                <label>Date</label>

                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-item">
                <label>Remarks / Notes</label>

                <input
                  type="text"
                  placeholder="Optional transaction reference details..."
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-submit"
                >
                  Record Entry
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}