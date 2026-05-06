import './editbills.css';
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Loading from '../loading';
import CustomerDetails from './customerdetail';
import Heading from '../heading';

function EditBill() {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [billDate, setBillDate] = useState(null);
    const [billNo, setBillNo] = useState(null);
    const [search, setSearch] = useState('');
    const [searchProduct, setSearchProduct] = useState([]);
    const [bill, setBill] = useState({});
    const [totalCost, setTotalCost] = useState(1);





    const [products, setProducts] = useState([]);



    useEffect(() => {
        const total = products.reduce((acc, item) =>
            acc + item.quantity * item.price, 0
        );
        setTotalCost(total);
    }, [products]);
    const navigate = useNavigate();

    const { id } = useParams(); // Controls the Popup
    const searchProducts = async (query) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/product/search?q=${encodeURIComponent(query)}`,
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
                return [];
            }

            return data;
        } catch (error) {
            return [];
        }
    };
    useEffect(() => {
        const load = async () => {
            const data = await searchProducts(search);
            setSearchProduct(data);

        };

        load()
    }, [search])

    useEffect(() => {
        if (!id) return;

        const fetchBill = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                setIsLoading(true);

                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/api/bill/${id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // 🔥 HANDLE STATUS FIRST
                if (response.status === 401) {
                    navigate("/login");
                    return;
                }

                if (response.status === 404) {
                    navigate("/");
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch bill");
                }


                if (data?.items) {
                    setProducts(
                        data.items.map(item => ({
                            id: item.product?._id,
                            name: item.nameSnapshot,
                            quantity: item.quantity,
                            price: item.salePriceSnapshot
                        }))
                    );

                    const dateOnly = new Date(data.billDate)
                        .toISOString()
                        .split("T")[0];

                    setBillDate(dateOnly);
                    setBillNo(data.billNo);
                    setBill(data);
                }

            } catch (error) {

                // optional fallback
                navigate("/");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBill();
    }, [id]);
    // Initial Products


    const [editingId, setEditingId] = useState(null);
    const [tempData, setTempData] = useState({});

    // --- Add Product Logic ---
    // const handleAddProduct = () => {
    //     if (!newProduct.quantity || !newProduct.price) {
    //         alert("Please enter Quantity and Price");
    //         return;
    //     }

    //     const newItem = {
    //         id: Date.now(), // Generate unique ID
    //         name: newProduct.name,
    //         quantity: Number(newProduct.quantity),
    //         price: Number(newProduct.price)
    //     };

    //     setProducts([...products, newItem]);
    //     setIsModalOpen(false); // Close popup
    //     setNewProduct({ name: "name", quantity: 4, price: 456 }); // Reset form
    // };

    // --- Inline Edit Logic ---
    const handleEditClick = (product) => {
        setEditingId(product.id);
        setTempData({ ...product });

    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = name === "name" ? value : Number(value);
        setTempData({ ...tempData, [name]: formattedValue });
    };

    const saveRow = (id) => {
        setProducts(products.map((p) => (p.id === id ? tempData : p)));
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    const deleteRow = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    // const handleSaveBill = () => {
    //     setIsLoading(true);
    //     setTimeout(() => {
    //         setIsLoading(false);
    //         alert("Whole Bill Saved!");
    //     }, 2000);
    // };

    const downloadBill = async () => {
        if (!id) return;

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/bill/download/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to download bill");
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `bill-${billNo}.pdf`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            alert("Error downloading bill");
        } finally {
            setIsLoading(false);
        }
    };
    const handleSaveBill = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {

                navigate("/login");
                return;
            }
            setIsLoading(true);

            const payload = {
                items: products.map(p => ({
                    product: p.id,
                    quantity: p.quantity,
                    salePrice: p.price
                })),
            };

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/bill/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,

                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.status === 401) {
                navigate("/login");
                return;
            }
            if (!response.ok) {
                throw new Error(data.error || "Bill update failed");
                alert(data.error);
                navigate("/");

            }

            alert("Bill Updated Successfully!");

        } catch (error) {
            alert(`Error updating bill: ${error}`);

        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='billing-container'>
            {isLoading && <Loading />}

            {/* --- ADD PRODUCT MODAL --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="search-form-container popup-content">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 style={{ fontWeight: 600, color: 'white', margin: 0 }}>Product Search & Entry</h2>
                            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <div className="input-group-search-edit">
                            <div className="search-container-edit">
                                <input type="text" className="search-input" placeholder='Search Product (Typing):' onChange={(e) => { setSearch(e.target.value) }} />
                                <div className="dropdown">
                                    {searchProduct.map((product) => {
                                        return (
                                            <div className="dropdown-item" >{product.name}</div>
                                        )
                                    })


                                    }

                                </div>
                            </div>
                        </div>

                        {/* <div className="info-text text-white my-2">Selected Product: <strong>{newProduct.name}</strong></div> */}

                        <div className="input-group-search-edit">
                            <label>Available:</label>
                            {/* <input type="text" value={newProduct.quantity} disabled className="display-box" /> */}
                        </div>

                        <div className="input-group-search-edit">
                            <label>Enter Quantity:</label>
                            <input
                                type="number"
                                className="input-box"
                            // value={quantity}
                            // onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>

                        <div className="input-group-search-edit">
                            <label>Manual Sale Price:</label>
                            <input
                                type="number"
                                className="input-box"
                            // value={price}
                            // onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        {/* <button className="add-button-edit w-100 mt-3" onClick={handleAddProduct}>Add to Bill</button> */}
                    </div>
                </div>
            )}

            <div className='d-flex flex-column billing-box'>
                <Heading heading={'EDIT BILL'} />
                <div className="mt-3 table-container-billing">
                    <div className="search-detail-container">
                        <CustomerDetails
                            id={billNo}
                            date={billDate}
                        />
                        {/* <button className="add-button-edit" onClick={() => setIsModalOpen(true)}>Add new product</button> */}
                    </div>

                    <div className="bill-board-container">
                        {/* Table Section */}
                        <div className='bill-board-box'>
                            <table className="product-table text-center">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th className="actions-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td>
                                                {editingId === product.id ? (
                                                    <input
                                                        type="number" name="quantity"
                                                        className="form-control form-control-sm mx-auto edit-input"
                                                        value={tempData.quantity} onChange={handleInputChange} onKeyDown={(e) => {
                                                            if (e.key === "-" || e.key === "e") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                ) : product.quantity}
                                            </td>
                                            <td>
                                                {editingId === product.id ? (
                                                    <input
                                                        type="number" name="price"
                                                        className="form-control form-control-sm mx-auto edit-input"
                                                        value={tempData.price} onChange={handleInputChange} onKeyDown={(e) => {
                                                            if (e.key === "-" || e.key === "e") {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                ) : product.price}
                                            </td>
                                            <td className="actions">
                                                {editingId === product.id ? (
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <span className="text-success pointer" onClick={() => saveRow(product.id)}>✔</span>
                                                        <span className="text-danger pointer" onClick={cancelEdit}>✖</span>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex justify-content-center gap-3">
                                                        <span className="edit-icon pointer" onClick={() => handleEditClick(product)}>&#9998;</span>
                                                        <span className="delete-icon pointer" onClick={() => deleteRow(product.id)}>&#128465;</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Save Bill Container */}
                        <div className='bill-confirmations-container'>
                            <div className="summary-box">
                                <div className="amount-row">
                                    <span className="label">Total Amount:</span>
                                    <span className="value">
                                        Rs. {totalCost}
                                    </span>
                                </div>
                                {/* <button className="print-btn" onClick={handleSaveBill}>Save Bill</button>
                                <button className="btn btn-primary" onClick={downloadBill}>Download Bill</button> */}
                                <div className="button-row">
                                    <button className="btn btn-danger" onClick={downloadBill}>
                                        Download
                                    </button>
                                    <button className="print-btn" onClick={handleSaveBill}>
                                        Save Bill
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditBill;