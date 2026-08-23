// src/pages/FeeManagement.jsx
import React, { useState, useEffect } from "react";
import { Receipt, Search, RefreshCw, Download } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";

function numberToWords(num) {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  return numberToWords(Math.floor(num / 1000000)) + ' Million' + (num % 1000000 ? ' ' + numberToWords(num % 1000000) : '');
}

export default function FeeManagement() {
  const [challans, setChallans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [billingMonth, setBillingMonth] = useState("August 2026");
  const [dueDate, setDueDate] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const [challanRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/fees`),
        fetch(`${API_BASE}/fees/summary`),
      ]);
      const challanData = await challanRes.json();
      const summaryData = await summaryRes.json();
      if (challanData.success) setChallans(challanData.data);
      if (summaryData.success) setSummary(summaryData.data);
    } catch (error) {
      toast.error("Failed to load fee records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const generateChallans = async (e) => {
    e.preventDefault();
    if (!dueDate) return toast.error("Please specify due date");
    try {
      setGenerating(true);
      const res = await fetch(`${API_BASE}/fees/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingMonth, dueDate }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchFeeData();
      } else {
        toast.error(data.message || "Generation failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/fees/${id}/pay`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment recorded");
        fetchFeeData();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const downloadChallan = (challan) => {
    const total = challan.tuitionFee + challan.otherCharges + challan.lateFine;
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Challan-${challan.challanNo}</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;background:#f5f5f5;margin:0}
.container{max-width:700px;margin:0 auto;background:#fff;padding:30px 35px;border:1px solid #ddd}
.header{text-align:center;border-bottom:2px solid #1a56db;padding-bottom:12px;margin-bottom:18px}
.header h1{margin:0;color:#1a56db;font-size:22px;font-weight:700}
.header p{margin:4px 0 0;color:#666;font-size:13px}
.title{text-align:center;margin-bottom:18px}
.title h2{margin:0;color:#333;font-size:18px}
.title .no{font-size:13px;color:#666;margin-top:4px}
.title .no strong{color:#1a56db}
.info{margin-bottom:15px}
.row{display:flex;padding:6px 0;border-bottom:1px solid #f0f0f0}
.row .label{width:120px;font-weight:600;color:#555;font-size:13px}
.row .value{flex:1;color:#333;font-size:13px}
.table{width:100%;border-collapse:collapse;margin:12px 0}
.table th{background:#f5f5f5;padding:7px 10px;text-align:left;font-size:13px;border-bottom:2px solid #ddd}
.table td{padding:7px 10px;border-bottom:1px solid #eee;font-size:13px}
.table .total{font-weight:700;border-top:2px solid #1a56db}
.words{background:#f8fafc;padding:8px 12px;border-left:3px solid #1a56db;font-size:13px;margin:10px 0}
.status{display:inline-block;padding:2px 12px;font-size:12px;font-weight:700}
.status.paid{background:#d1fae5;color:#065f46}
.status.unpaid{background:#fee2e2;color:#991b1b}
.payment{background:#fef3c7;padding:10px 14px;border:1px solid #fbbf24;margin:12px 0}
.payment strong{font-size:13px}
.payment p{font-size:12px;margin:4px 0 0;color:#78350f;line-height:1.6}
.tear{margin-top:20px;border-top:2px dashed #ccc;padding-top:15px}
.tear-label{text-align:center;font-size:11px;color:#999;margin-bottom:8px}
.tear-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tear-item{border:1px solid #ddd;padding:6px 8px;text-align:center}
.tear-item .lbl{font-size:10px;color:#999;text-transform:uppercase}
.tear-item .val{font-weight:700;font-size:13px;margin-top:2px}
.footer{margin-top:18px;padding-top:12px;border-top:1px solid #ddd;text-align:center;font-size:12px;color:#999}
.sign{display:flex;justify-content:space-around;margin-top:15px}
.sign div{text-align:center}
.sign .line{width:120px;border-top:1px solid #333;margin:4px auto}
.sign span{font-size:11px;color:#666}
@media print{body{background:#fff;padding:20px}.container{border:none;padding:20px}}
@media(max-width:600px){.container{padding:15px}.row{flex-wrap:wrap}.row .label{width:100%}.tear-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="container">
<div class="header"><h1>CAMPUS HUB UNIVERSITY</h1><p>Fee Challan</p></div>
<div class="title"><h2>FEE CHALLAN</h2><div class="no"><strong>${challan.challanNo}</strong> | <span class="status ${challan.status.toLowerCase()}">${challan.status}</span></div></div>
<div class="info">
<div class="row"><span class="label">Student</span><span class="value">${challan.student?.fullName || 'Unassigned'}</span></div>
<div class="row"><span class="label">Roll No</span><span class="value">${challan.student?.admissionNo || 'N/A'}</span></div>
<div class="row"><span class="label">Department</span><span class="value">${challan.student?.department || 'N/A'}</span></div>
<div class="row"><span class="label">Semester</span><span class="value">${challan.student?.semester ? 'Semester ' + challan.student.semester : 'N/A'}</span></div>
<div class="row"><span class="label">Month</span><span class="value">${challan.billingMonth}</span></div>
<div class="row"><span class="label">Due Date</span><span class="value">${new Date(challan.dueDate).toLocaleDateString()}</span></div>
</div>
<table class="table"><thead><tr><th>Particulars</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>
<tr><td>Tuition Fee</td><td style="text-align:right">$${challan.tuitionFee.toLocaleString()}</td></tr>
<tr><td>Other Charges</td><td style="text-align:right">$${challan.otherCharges.toLocaleString()}</td></tr>
${challan.lateFine > 0 ? `<tr><td>Late Fine</td><td style="text-align:right">$${challan.lateFine.toLocaleString()}</td></tr>` : ''}
<tr class="total"><td>Total</td><td style="text-align:right">$${total.toLocaleString()}</td></tr>
</tbody></table>
<div class="words"><strong>In Words:</strong> ${numberToWords(total)} Dollars</div>
<div class="payment"><strong>Payment Instructions</strong><p>Bank: National Bank of Pakistan<br>Account: Campus Hub University<br>Account No: 1234-5678-9012-3456<br>Reference: ${challan.challanNo}</p></div>
<div class="tear"><div class="tear-label">✂ CUT HERE ✂</div><div class="tear-grid">
<div class="tear-item"><div class="lbl">Challan No</div><div class="val">${challan.challanNo}</div></div>
<div class="tear-item"><div class="lbl">Student</div><div class="val">${challan.student?.fullName || 'N/A'}</div></div>
<div class="tear-item"><div class="lbl">Amount</div><div class="val">$${total.toLocaleString()}</div></div>
<div class="tear-item"><div class="lbl">Due Date</div><div class="val">${new Date(challan.dueDate).toLocaleDateString()}</div></div>
</div></div>
<div class="footer"><p>Generated: ${new Date().toLocaleString()}</p><div class="sign">
<div><div class="line"></div><span>Student</span></div>
<div><div class="line"></div><span>Accounts</span></div>
<div><div class="line"></div><span>Registrar</span></div>
</div></div>
</div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Challan-${challan.challanNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Challan downloaded');
  };

  const filtered = challans.filter((c) => {
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const name = c.student?.fullName || "";
    const adm = c.student?.admissionNo || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      adm.toLowerCase().includes(search.toLowerCase()) ||
      c.challanNo.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="fee-container">
      {/* Header */}
      <div className="fee-header">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">Generate, view and download challans</p>
        </div>
        <button className="btn-refresh" onClick={fetchFeeData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="fee-summary-grid">
          <div className="fee-stat-card">
            <div className="fee-stat-icon total"><Receipt size={20} color="#38BDF8" /></div>
            <div>
              <span className="fee-stat-label">Total Invoiced</span>
              <h3 className="fee-stat-value">${summary.totalInvoiced.toLocaleString()}</h3>
            </div>
          </div>
          <div className="fee-stat-card">
            <div className="fee-stat-icon collected"><Receipt size={20} color="#10B981" /></div>
            <div>
              <span className="fee-stat-label">Collected</span>
              <h3 className="fee-stat-value">${summary.totalCollected.toLocaleString()}</h3>
            </div>
          </div>
          <div className="fee-stat-card">
            <div className="fee-stat-icon pending"><Receipt size={20} color="#EF4444" /></div>
            <div>
              <span className="fee-stat-label">Pending</span>
              <h3 className="fee-stat-value">${summary.totalPending.toLocaleString()}</h3>
            </div>
          </div>
          <div className="fee-stat-card">
            <div className="fee-stat-icon recovery"><Receipt size={20} color="#F59E0B" /></div>
            <div>
              <span className="fee-stat-label">Recovery Rate</span>
              <h3 className="fee-stat-value">{summary.recoveryRate}%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Generate Form */}
      <div className="generation-bar-card">
        <div className="generation-bar-title">
          <Receipt size={18} color="#3B82F6" />
          <span>Generate Invoices</span>
        </div>
        <form onSubmit={generateChallans} className="generation-form">
          <div className="form-inline-group">
            <label>Billing Month</label>
            <input type="text" required value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} placeholder="e.g. August 2026" />
          </div>
          <div className="form-inline-group">
            <label>Due Date</label>
            <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <button type="submit" disabled={generating} className="btn-generate">
            {generating ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="table-controls-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by name, roll no, or invoice..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-pill-group">
          {["All", "Unpaid", "Paid"].map((status) => (
            <button key={status} className={`pill-btn ${statusFilter === status ? "active" : ""}`} onClick={() => setStatusFilter(status)}>
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="fee-table-card">
        <table className="fee-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Student</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="table-empty-msg">Loading...</td></tr>
            ) : !filtered.length ? (
              <tr><td colSpan="8" className="table-empty-msg">No invoices found</td></tr>
            ) : (
              filtered.map((c) => {
                const total = c.tuitionFee + c.otherCharges + c.lateFine;
                return (
                  <tr key={c._id}>
                    <td className="cell-challan-no">{c.challanNo}</td>
                    <td>
                      <div className="student-name">{c.student?.fullName || "Unassigned"}</div>
                      <div className="student-sub">{c.student?.admissionNo} • {c.student?.department}</div>
                    </td>
                    <td className="cell-month">{c.billingMonth}</td>
                    <td className="cell-amount">${total.toLocaleString()}</td>
                    <td className="cell-date">{new Date(c.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {c.status === "Unpaid" && (
                          <button onClick={() => markPaid(c._id)} className="btn-mark-paid">Mark Paid</button>
                        )}
                        <button onClick={() => downloadChallan(c)} className="btn-download" title="Download Challan">
                          <Download size={15} color="#3B82F6" /> Download
                        </button>
                        {c.status === "Paid" && (
                          <span className="text-paid-date">{new Date(c.paidDate || c.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}