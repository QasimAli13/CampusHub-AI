import { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart as PieIcon,
  AlertCircle,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../api/axios";

const CHART_COLORS = ["#48CAE4", "#4ade80", "#facc15", "#f87171", "#c084fc"];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [semesterChartData, setSemesterChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [totals, setTotals] = useState({
    assignments: 0,
    complaints: 0,
    events: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [assignmentsRes, eventsRes, complaintsRes] =
        await Promise.allSettled([
          API.get("/assignments"),
          API.get("/events"),
          API.get("/complaints"),
        ]);

      const assignments =
        assignmentsRes.status === "fulfilled"
          ? assignmentsRes.value.data?.data || assignmentsRes.value.data || []
          : [];

      const events =
        eventsRes.status === "fulfilled"
          ? eventsRes.value.data?.data || eventsRes.value.data || []
          : [];

      const complaints =
        complaintsRes.status === "fulfilled"
          ? complaintsRes.value.data?.data || complaintsRes.value.data || []
          : [];

      const assignArray = Array.isArray(assignments) ? assignments : [];
      const eventsArray = Array.isArray(events) ? events : [];
      const complaintsArray = Array.isArray(complaints) ? complaints : [];

      setTotals({
        assignments: assignArray.length,
        events: eventsArray.length,
        complaints: complaintsArray.length,
      });

      // 1. Process Real Semester-wise Data (No Dummy Fallback)
      const semMap = {};
      assignArray.forEach((item) => {
        const sem = `Sem ${item.semester || 1}`;
        semMap[sem] = (semMap[sem] || 0) + 1;
      });
      const semData = Object.keys(semMap).map((key) => ({
        semester: key,
        assignments: semMap[key],
      }));
      setSemesterChartData(semData);

      // 2. Process Real Complaints Data (No Dummy Fallback)
      const catMap = {};
      complaintsArray.forEach((c) => {
        const cat = c.category || "General";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const catData = Object.keys(catMap).map((k) => ({
        name: k,
        value: catMap[k],
      }));
      setCategoryChartData(catData);
    } catch (err) {
      console.error("Analytics Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Campus Visual Analytics</h1>
        <p className="page-subtitle">
          Real-time statistical breakdown of academic workload and campus
          grievances.
        </p>
      </div>

      {/* Analytics Overview Metric Cards */}
      <div className="analytics-metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-box cyan">
            <FileCheck size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{totals.assignments}</span>
            <span className="metric-label">Published Tasks</span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box yellow">
            <AlertCircle size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{totals.complaints}</span>
            <span className="metric-label">Campus Grievances</span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box green">
            <TrendingUp size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{totals.events}</span>
            <span className="metric-label">Total Society Events</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="charts-grid">
        {/* Semester-wise Bar Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <BarChart3 size={18} color="#48CAE4" /> Assignments by Semester
            </h3>
            <span className="badge badge-neutral">Workload Distribution</span>
          </div>

          <div className="chart-box-wrapper">
            {semesterChartData.length === 0 ? (
              <div className="modal-state-box">
                <p className="text-subtle">
                  No assignments created yet to display chart.
                </p>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={semesterChartData}>
                  <XAxis
                    dataKey="semester"
                    stroke="#8D99AE"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#8D99AE" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1C2541",
                      borderColor: "rgba(72, 202, 228, 0.2)",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Bar
                    dataKey="assignments"
                    fill="#48CAE4"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Complaints Breakdown Donut Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <PieIcon size={18} color="#4ade80" /> Grievances by Category
            </h3>
            <span className="badge badge-neutral">Issue Density</span>
          </div>

          <div className="chart-box-wrapper">
            {categoryChartData.length === 0 ? (
              <div className="modal-state-box">
                <p className="text-subtle">
                  No grievance tickets found to display chart.
                </p>
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1C2541",
                      borderColor: "rgba(72, 202, 228, 0.2)",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
