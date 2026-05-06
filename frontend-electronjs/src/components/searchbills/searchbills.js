import './searchbills.css';
import { useState, useEffect } from "react";
import Loading from '../loading';
import { useNavigate } from "react-router-dom";
import Heading from '../heading';


function SearchBill() {
    const [open, setOpen] = useState(true);
    const [active, setActive] = useState("inventory");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bill, setBills] = useState([]);
    const [search, setSearch] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const navigate = useNavigate();

    const searchBills = async (query) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/bill/search?q=${encodeURIComponent(query)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                navigate('/login');
                return []
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch bills");
                return []
            }

            return data;
        } catch (error) {
            console.error("Search error:", error);
            return [];
        }
    };

    const getBillsByDate = async (day) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/bill/date?day=${day}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                navigate("/login");
                return [];
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch bills");
            }

            return data;
        } catch (error) {
            console.error("Error fetching bills:", error.message);
            return [];
        }
    };

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
            return null;
        }
    };

    const handleEdit = (id) => {
        navigate(`/edit-bill/${id}`);
    };
    useEffect(() => {
        const init = async () => {
            await checkStatus();
        };

        init();
    }, []);
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (search.trim() === "") {
                setBills([]);
            } else {
                const results = await searchBills(search);
                setBills(results);
            }
        }, 400);

        return () => clearTimeout(delay); // cancel previous call
    }, [search]);

    useEffect(() => {
        const delay = setTimeout(async () => {

            const results = await getBillsByDate(searchDate);
            setBills(results);
        }, 400);

        return () => clearTimeout(delay); // cancel previous call
    }, [searchDate]);

    useEffect(() => {
        document.title = `Search | ${process.env.REACT_APP_ORGANIZATION_NAME || "Search | Stockify Inventory System"}`;
    }, []);
    return (
        <div className='search-bill-container'>
            {isLoading ?
                <Loading /> : null
            }
            <div className='d-flex flex-column search-billing-box'>
                <Heading
                    heading={"SEARCH BILLS"}
                />
                {/* <div className='search-billing-box-head'>
                    Search Bill
                </div> */}

                <div className="mt-3 table-container-billing-search">
                    <div class="search-bill-date-container">
                        <div class="search-group-search">
                            <label for="search-date-search">Search by Date:</label>
                            <div class="input-wrapper-search">
                                <input type="date" id="date-search" value={searchDate} onChange={(e) => { setSearchDate(e.target.value) }} />
                            </div>
                        </div>

                        <div class="search-group-search">
                            <label for="phone-search">Search by ID:</label>
                            <div class="input-wrapper-search">
                                <input type="text" id="phone-search" placeholder="MO311118-3" onChange={(e) => { setSearch(e.target.value) }} />
                            </div>
                        </div>

                    </div>
                    <div class="table-container-search">
                        <table class="billing-table">
                            <thead>
                                <tr>
                                    <th><span>Bill ID</span></th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                                            No bills found
                                        </td>
                                    </tr>
                                ) : (
                                    bill.map((bills, index) => (
                                        <tr key={bills._id || index}>
                                            <td>
                                                <a className="bill-link" onClick={() => handleEdit(bills._id)}>
                                                    #{bills.billNo}
                                                </a>
                                            </td>
                                            <td>{bills.createdAt}</td>
                                            <td>Rs. {bills.totalSale}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchBill;
