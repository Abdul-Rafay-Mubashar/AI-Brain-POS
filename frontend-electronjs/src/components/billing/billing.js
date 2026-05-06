import './billing.css';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from '../loading';
import VoicePOSRecorder from './audioinput';
import Heading from '../heading';


function Bill() {
    const [open, setOpen] = useState(true);
    const [active, setActive] = useState("billing");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [Price, setPrice] = useState(0);
    const [tolPrice, setTolPrice] = useState(0);
    const [search, setSearch] = useState("");
    const [searchCon, setSearchCon] = useState(false);

    const [products, setProducts] = useState([]);
    const [billProducts, setBillProducts] = useState([]);
    const [render, setRender] = useState(false)
    const [audio, setAudioData] = useState([])
    const [audioInput, setAudioInput] = useState(false)
    const [audioInputIndex, setAudioInputIndex] = useState(0)




    const navigate = useNavigate();

    const getAudioData = (data) => {
        setAudioData(data)

    }


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
                setRender(true);
                navigate('/login')

                return null;
            }

        } catch (error) {
            alert("Something went wrong");
            navigate("/login");

            return null;
        }
    };

    const deleteProductFromBill = (deleteProduct) => {
        if (!deleteProduct) return;

        setBillProducts((prev) =>
            prev.filter((item) => item.product !== deleteProduct)
        );

        setIsDeleteOpen(false);
        setDeleteProduct(null);
    };

    const addProducts = () => {
        if (!selectedProduct?._id) {
            alert("Please select a product");
            return;
        }

        const qty = Number(quantity);
        const price = Number(Price);

        if (!qty || qty <= 0) {
            alert("Quantity must be greater than 0");
            return;
        }

        if (!price || price <= 0) {
            alert("Sale price must be greater than 0");
            return;
        }

        if (qty > selectedProduct.quantity) {
            alert(`Only ${selectedProduct.quantity} items available in stock`);
            setSelectedProduct(null);
            setQuantity(0);
            setPrice(0);
            return;
        }

        setBillProducts((prev) => {
            let updated = [...prev];

            const index = updated.findIndex(
                (p) => p.product === selectedProduct._id
            );

            if (index !== -1) {
                const newQty = updated[index].quantity + qty;

                if (newQty > selectedProduct.quantity) {
                    alert(
                        `Total quantity exceeds stock. Available: ${selectedProduct.quantity}`
                    );
                    return prev;
                }

                updated[index].quantity = newQty;
                updated[index].salePrice = price;
            } else {
                updated.push({
                    product: selectedProduct._id,
                    quantity: qty,
                    salePrice: price,
                    name: selectedProduct.name,
                    available: selectedProduct.quantity,
                });
            }

            return updated;
        });

        setSelectedProduct(null);
        setQuantity(0);
        setPrice(0);
    };


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

    const handleSave = async () => {
        if (billProducts.length < 1) {
            alert(`Bill contain no products`);
            return
        }
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const payload = {
                items: billProducts.map(item => ({
                    product: item.product,
                    quantity: Number(item.quantity),
                    salePrice: Number(item.salePrice),
                }))
            };

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/bill/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (response.status === 401) {
                navigate('/login');
                return []
            }
            if (!response.ok) {
                alert(`Bill save failed: ${data.error}`);
                setIsLoading(false)
                return
            }
            alert("Bill saved sucessfully")
            setIsLoading(false)
            navigate('/')
        } catch (error) {
            return [];
        }

    };

    const changeSelectedItem = (item) => {
        setSelectedProduct(item)

    }

    useEffect(() => {
        const load = async () => {
            const data = await searchProducts(search);
            setProducts(data);


        };

        load()
    }, [search])

    useEffect(() => {
        if (products.length > 0) {
            setSearchCon(true)
        }
        else {
            setSearchCon(false)

        }


    }, [products])
    useEffect(() => {
        const total = billProducts.reduce((sum, item) => {
            return sum + (item.quantity * item.salePrice);
        }, 0);

        setTolPrice(total);
    }, [billProducts]);

    useEffect(() => {
        const load = async () => {
            await checkStatus();
            setRender(true)
        };

        load();
    }, []);

    useEffect(() => {
        if (!audio?.length) return;

        if (audioInputIndex < audio.length && !audioInput) {
            const item = audio[audioInputIndex];

            changeSelectedItem(item.item);
            setQuantity(item.proposed_quantity);
            setPrice(item.proposed_price);

            setAudioInputIndex(prev => prev + 1);
            setAudioInput(true);
        }
        else if (audioInputIndex === audio.length && audio.length !== 0) {
            setAudioInputIndex(0);
            setAudioInput(false);
            setAudioData([])

        }

    }, [audio, audioInput, audioInputIndex]);



    useEffect(() => {
        if (!audioInput) return;


        addProducts();

        setAudioInput(false);

    }, [audioInput]);
    useEffect(() => {
        document.title = `Billing | ${process.env.REACT_APP_ORGANIZATION_NAME || "Billing | Stockify Inventory System"}`;

    }, []);
    return (
        <>
            {render ?
                <div className='billing-container'>
                    {isLoading ?
                        <Loading /> : null
                    }
                    <div className='d-flex flex-column billing-box'>
                        {/* <div className='billing-box-head'>
                            BILLING
                        </div> */}
                        <Heading
                            heading={'BILLING'}
                        />
                        <div className="table-container-billing">
                            <div class="search-form-container-billing">
                                <h2 style={{ fontWeight: 600, color: 'white' }}>Product Search & Entry</h2>

                                <div class="input-group-search">
                                    <div class="search-container">
                                        <input type="text" class="search-input" placeholder='Search Product (Typing):' onChange={(e) => setSearch(e.target.value)} />
                                        <div className={`dropdown ${searchCon ? "show" : "hide"}`}>
                                            {products?.map((product) => (
                                                <div class="dropdown-item" onClick={() => changeSelectedItem(product)}>{product.name}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div class="info-text">Selected Product: <strong>{selectedProduct?.name}</strong></div>

                                <div class="input-group-search">
                                    <label>Available:</label>
                                    <input type="text" value={selectedProduct?.quantity} disabled class="display-box" />
                                </div>

                                <div class="input-group-search">
                                    <label>Enter Quantity:</label>
                                    <input type="text" value={quantity} class="input-box" onKeyDown={(e) => {
                                        if (e.key === "-" || e.key === "e") {
                                            e.preventDefault();
                                        }
                                    }} onChange={(e) => { setQuantity(e.target.value) }} />
                                </div>

                                <div class="input-group-search">
                                    <label>Manual Sale Price:</label>
                                    <input type="text" value={Price} class="input-box" onKeyDown={(e) => {
                                        if (e.key === "-" || e.key === "e") {
                                            e.preventDefault();
                                        }
                                    }} onChange={(e) => { setPrice(e.target.value) }} />
                                </div>

                                <button class="add-button" onClick={addProducts}>Add to Bill</button>
                            </div>
                            <div className="bill-board-container">
                                <div className='bill-board-box'>
                                    <table className="product-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th className="actions-header">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billProducts.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.salePrice}</td>

                                                    <td className="actions">
                                                        <span
                                                            className="delete-icon"
                                                            onClick={() => { deleteProductFromBill(item.product) }}
                                                        >
                                                            &#128465;
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}

                                        </tbody>
                                    </table>


                                </div>
                                <div className='bill-confirmations-container'>
                                    <VoicePOSRecorder
                                        getdata={getAudioData}
                                    />

                                    <div class="summary-box">
                                        <div class="amount-row">
                                            <span class="label">Total Amount:</span>
                                            <span class="value">Rs. {tolPrice}</span>
                                        </div>
                                        <button class="print-btn" onClick={handleSave}>Save Bill</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> : <Loading />}
        </>
    );
}

export default Bill;
