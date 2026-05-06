import React, { useEffect, useState } from "react";
import "./week.css";
import { useNavigate } from "react-router-dom";

const WeeklyReport = () => {
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const calculateHeight = (value, max) => {
    if (!max) return "0%";
    const percentage = (value / max) * 100;
    return `${Math.min(Math.max(percentage, 0), 100)}%`;
  };

  // ✅ API Call
  const getWeeklyReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/reports/weekly`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) return navigate("/login");
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setWeeklyReport(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeeklyReport();
  }, []);

  // ✅ max + better rounding
  const maxVal =
    weeklyReport.length > 0
      ? Math.max(...weeklyReport.map((i) => i.totalSale))
      : 1;

  // 🔥 smooth rounded scale (important fix)
  const roundedMax = Math.ceil(maxVal / 5000) * 5000;

  const steps = 5;
  const stepValue = roundedMax / steps;

  const yMarkers = Array.from(
    { length: steps + 1 },
    (_, i) => Math.round(stepValue * (steps - i))
  );

  // totals
  const totalSales = weeklyReport.reduce((s, d) => s + d.totalSale, 0);
  const totalCost = weeklyReport.reduce((s, d) => s + d.totalCost, 0);
  const totalProfit = weeklyReport.reduce((s, d) => s + d.totalProfit, 0);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;
  if (weeklyReport.length === 0) return <h2>No data found</h2>;

  return (
    <div className="report-card">
      <h3>Weekly Report</h3>
      <p className="subtitle">Last 6 days performance</p>

      <div className="chart-container">
        {/* Y Axis */}
        <div className="y-axis">
          {yMarkers.map((mark, i) => (
            <span key={i}>{mark.toLocaleString()}</span>
          ))}
        </div>

        {/* Chart */}
        <div className="chart-area">
          <div className="grid-lines">
            {yMarkers.map((_, i) => (
              <div key={i} className="grid-line"></div>
            ))}
          </div>

          <div className="bars-wrapper">
            {weeklyReport.map((item, index) => (
              <div key={index} className="bar-column">
                
                {/* 🔥 value label */}
                <span className="bar-value">
                  {item.totalSale.toLocaleString()}
                </span>

                <div
                  className="bar-week"
                  style={{
                    height: calculateHeight(
                      item.totalSale,
                      roundedMax
                    ),
                  }}
                ></div>

                <span className="day-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="stats-footer">
        <div className="stat-box">
          <label>Total Sales</label>
          <strong>Rs. {totalSales.toLocaleString()}</strong>
        </div>
        <div className="stat-box">
          <label>Total Cost</label>
          <strong>Rs. {totalCost.toLocaleString()}</strong>
        </div>
        <div className="stat-box">
          <label>Total Profit</label>
          <strong>Rs. {totalProfit.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;