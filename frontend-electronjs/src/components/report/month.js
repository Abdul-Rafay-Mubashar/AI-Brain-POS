import React, { useEffect, useState } from "react";
import "./month.css";
import { useNavigate } from "react-router-dom";

const MonthlyReport = ({ CustomDate }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const getMonthlyReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/reports/monthly`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 401) {
        navigate('/login');
        return []
      }
      if (!res.ok) throw new Error("Failed to fetch monthly report");

      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMonthlyReport();
  }, []);

  // UI states
  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;
  if (!report) return <h2>No data found</h2>;

  const totalSales = report.totalSale || 0;
  const totalProfit = report.totalProfit || 0;

  const percentage =
    totalSales > 0
      ? Math.round((totalProfit / totalSales) * 100)
      : 0;

  return (
    <div className="report-card">
      <div className="card-header">
        <h3>Monthly Report</h3>
        <button className="date-btn" onClick={CustomDate}>
          Set Custom Date
        </button>
      </div>

      <p className="subtitle">
        {report.month || "Current Month"}
      </p>

      <div className="monthly-content">
        {/* Stats */}
        <div className="monthly-stats">
          <div className="stat-item">
            <label>Total Sales</label>
            <div className="value">
              Rs. {totalSales.toLocaleString()}
            </div>
          </div>

          <div className="stat-item">
            <label>Total Profit</label>
            <div className="value">
              Rs. {totalProfit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="donut-container">
          <label className="donut-label">Profit Margin</label>

          <div
            className="donut-chart"
            style={{ "--p": percentage }}
          >
            <div className="donut-inner">
              {percentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;