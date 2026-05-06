import './menu.css';
import { useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Menu() {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const LogOut = async () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    // 🎯 ACTIVE MENU FROM URL
    const getActiveMenu = () => {
        if (location.pathname === "/") return "dashboard";
        if (location.pathname === "/search-bill") return "inventory";
        if (location.pathname === "/billing") return "billing";
        if (location.pathname === "/reports") return "report";
        return "";
    };

    return (
        <div
            className="d-flex flex-column vh-100 menu-body shadow"
            style={{
                width: open ? "280px" : "80px",
                transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: "#1a1d2d",
                overflow: "hidden"
            }}
        >

            {/* TOP LOGO */}
            <div className="d-flex align-items-center p-3 mb-4 border-bottom border-secondary shadow-sm" style={{ height: "80px" }}>
                <div className="logo-icon d-flex align-items-center justify-content-center" style={{ minWidth: "45px" }}>
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#5de4ff" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>

                {open && (
                    <span className="ms-3 fw-bold fs-4 text-uppercase text-white" style={{ letterSpacing: "2px" }}>
                        INVENTO
                    </span>
                )}
            </div>

            {/* NAV LINKS */}
            <div className="flex-grow-1 px-3">

                <div className="d-flex flex-column gap-2">

                    {/* DASHBOARD */}
                    <Link
                        to="/"
                        className={`menu-btn d-flex align-items-center text-decoration-none ${
                            getActiveMenu() === "dashboard" ? "active" : ""
                        }`}
                    >
                        <i className="bi bi-speedometer2 fs-5"></i>
                        {open && <span className="ms-3">Dashboard</span>}
                    </Link>

                    {/* INVENTORY / SEARCH BILLS */}
                    <Link
                        to="/search-bill"
                        className={`menu-btn d-flex align-items-center text-decoration-none ${
                            getActiveMenu() === "inventory" ? "active" : ""
                        }`}
                    >
                        <i className="bi bi-box-seam fs-5"></i>
                        {open && <span className="ms-3">Search Bills</span>}
                    </Link>

                    {/* BILLING */}
                    <Link
                        to="/billing"
                        className={`menu-btn d-flex align-items-center text-decoration-none ${
                            getActiveMenu() === "billing" ? "active" : ""
                        }`}
                    >
                        <i className="bi bi-receipt fs-5"></i>
                        {open && <span className="ms-3">Billing</span>}
                    </Link>

                    {/* REPORTS */}
                    <Link
                        to="/reports"
                        className={`menu-btn d-flex align-items-center text-decoration-none ${
                            getActiveMenu() === "report" ? "active" : ""
                        }`}
                    >
                        <i className="bi bi-bar-chart fs-5"></i>
                        {open && <span className="ms-3">Reports</span>}
                    </Link>

                </div>
            </div>

            {/* LOGOUT */}
            <div className="mt-auto p-3 border-top border-secondary">
                <button
                    className="menu-btn d-flex align-items-center text-decoration-none logout-link text-danger"
                    onClick={LogOut}
                >
                    <i className="bi bi-box-arrow-right fs-5"></i>
                    {open && <span className="ms-3 fw-bold">Logout</span>}
                </button>
            </div>
        </div>
    );
}

export default Menu;