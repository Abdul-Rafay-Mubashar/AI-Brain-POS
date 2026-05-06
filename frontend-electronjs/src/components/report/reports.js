import './reports.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import WeeklyReport from './week';
import MonthlyReport from './month'
import CustomDate from './customDate';
import Heading from '../heading';
import Loading from '../loading';

function Reports() {
    const [open, setOpen] = useState(false);
    const [dailyReport, setDailyReport] = useState(null);
    const [bills, setBills] = useState([]);
    const [render, setRander] = useState(false);

    const navigate = useNavigate();

    const checkStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/auth/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            if (!response.ok) {
                navigate('/login')

                return null;
            }

        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong");
             navigate('/login')

            return null;
        }
    };


    const getBills = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/bill/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 401) {
                navigate('/login');
                return []
            }
            if (!response.ok) {
                throw new Error("Failed to fetch bills");
                setBills(null)
            }

            const data = await response.json();
            setBills(data)

        } catch (error) {
            console.error("Error fetching bills:", error);
            return null;
        }
    };

    const getDailyReport = async (date) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/reports/daily?date=${date}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 401) {
                navigate('/login');
                return []
            }
            if (!response.ok) {
                throw new Error("Failed to fetch daily report");
            }

            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    };

    const handleCustomDate = () => {
        setOpen(true)
    }

    useEffect(() => {
        const fetchData = async () => {
            await checkStatus()
            await getBills();
            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            const data = await getDailyReport(today);
            setDailyReport(data);
            setRander(true)
        };

        fetchData();
    }, []);

    // const bills = [
    //     { id: '#EM0010', date: 'Oct 26, 2024', amount: '2,450' },
    //     { id: '#EM0009', date: 'Oct 26, 2024', amount: '1,120' },
    //     { id: '#EM0008', date: 'Oct 26, 2024', amount: '2,450' },
    //     { id: '#EM0005', date: 'Oct 26, 2024', amount: '1,120' },
    //     { id: '#EM0004', date: 'Oct 25, 2024', amount: '1,450' },
    //     { id: '#EM0013', date: 'Oct 26, 2024', amount: '2,450' },
    //     { id: '#EM0005', date: 'Oct 26, 2024', amount: '1,120' },
    //     { id: '#EM0004', date: 'Oct 25, 2024', amount: '1,450' },
    //     { id: '#EM0013', date: 'Oct 26, 2024', amount: '2,450' },
    // ];
    const handleEdit = (id) => {
        navigate(`/edit-bill/${id}`);
    };
    useEffect(() => {
        document.title = `Reports | ${process.env.REACT_APP_ORGANIZATION_NAME || "Reports | Stockify Inventory System"}`;
    }, []);
    return (
        <>
            {render ?
                <div className='reports-container'>
                    {open ?
                        <CustomDate
                            isOpen={open}
                            onClose={() => setOpen(false)}
                        /> : null
                    }
                    <div className='d-flex flex-column reports-box'>
                        <Heading heading={'REPORTS'}/>
                        {/* // <div className='reports-box-head'>
                        //     REPORTS
                        // </div> */}
                        <div className="mt-1 bills-section">
                            <div className="bills-header">
                                <h2>Latest Bills</h2>

                            </div>

                            <div className="bills-container">
                                {
                                    bills === null ? (
                                        <h1>Failed to fetch bills</h1>
                                    ) : bills.length === 0 ? (
                                        <h1>No bills found</h1>
                                    ) : (
                                        [...bills].reverse().map((bill, index) => (
                                            <div key={index} className="bill-card">
                                                <div className="bill-id">{bill.billNo}</div>
                                                <div className="bill-detail">Date: {bill.createdAt}</div>
                                                <div className="bill-label">Total Amount</div>
                                                <div className="bill-amount">Rs. {bill.totalSale}</div>
                                                <button className="open-btn" onClick={() => {handleEdit(bill._id)}}>Open</button>
                                            </div>
                                        ))
                                    )
                                }
                            </div>
                            <div className="bottom-divider"></div>
                        </div>
                        <div className="dashboard-wrapper">
                            {/* Daily Report */}
                            <div className="report-card">
                                <div className="card-header">
                                    <h3>Daily Report ({dailyReport?.date})</h3>
                                </div>
                                <div className="stats-row">
                                    <div className="stat-item">
                                        <label>Total Sales</label>
                                        <div className="value">Rs. {dailyReport?.totalSale}</div>
                                    </div>
                                    <div className="stat-item">
                                        <label>Total Cost</label>
                                        <div className="value">Rs. {dailyReport?.totalCost}</div>
                                    </div>
                                    <div className="stat-item">
                                        <label>Total Profit</label>
                                        <div className="value">Rs. {dailyReport?.totalProfit}</div>
                                    </div>
                                </div>
                            </div>

                            <WeeklyReport />
                            <MonthlyReport CustomDate={handleCustomDate} />
                        </div>
                    </div>
                </div> : <Loading/>}
        </>
    );
}

export default Reports;
