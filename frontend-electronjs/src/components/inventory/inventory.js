import './inventory.css';
import Popup from './popup';
import UpdatePopup from './update';
import DeletePopup from './delete';
import { useState, useEffect } from "react";
import Loading from '../loading';
import { useNavigate } from "react-router-dom";
import InventoryHeader from './faceloginheading';
import Heading from '../heading';
import FaceEnroll from '../faceio/faceenroll';


function Inventory() {
    const [open, setOpen] = useState(true);
    const [active, setActive] = useState("dashboard");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [render, setRender] = useState(false)
    const [products, setProducts] = useState([]);
    const [faceLogin, setFaceLogin] = useState(false)
    const [user, setUser] = useState(null)


    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(false);

    const navigate = useNavigate();
    const checkStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return false;

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/auth/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const userData = await response.json()
            setUser(userData)
            return response.ok;

        } catch (error) {
            console.error("Error:", error);
            return false;
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/product/`,
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
                alert("Failed to load products");
                return [];
            }

            return data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
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
            console.error("Search error:", error);
            return [];
        }
    };

    useEffect(() => {
        const load = async () => {
            const isValid = await checkStatus();

            if (!isValid) {
                navigate('/login');
                return;
            }

            const data = await fetchProducts();
            setProducts(data);
            setRender(true);
        };

        load();
    }, [refresh]);


    useEffect(() => {
        const delay = setTimeout(async () => {
            if (search.trim() === "") {
                const all = await fetchProducts();
                setProducts(all);
            } else {
                const results = await searchProducts(search);
                setProducts(results);
            }
        }, 400);

        return () => clearTimeout(delay); // cancel previous call
    }, [search]);


    useEffect(() => {
        document.title = `Inventory | ${process.env.REACT_APP_ORGANIZATION_NAME || "Inventory | Stockify Inventory System"}`;
    }, []);

    
    useEffect(() => {
    }, [products, render]);
    const changeFaceLogin = async () => {
        setFaceLogin(true)
    }
    // if (!user) return <Loading />;
    return (
        <>
            {render ?
                <div className='billing-container'>
                    {faceLogin ?
                        <FaceEnroll/>:

                        <div className='d-flex flex-column billing-box'>
                            {/* <button onClick={() => setFaceLogin(true)}>Add face login</button> */}

                            {user?.descriptor ? (
                                <Heading heading={"INVENTORY"} />
                            ) : (
                                <InventoryHeader enable={changeFaceLogin} />
                            )}
                            <div className='billing-box-search'>
                                <div className='billing-box-search-head'>
                                    Current Products
                                </div>
                                <div className='billing-box-search-container'>
                                    <h3>Instant Search</h3>
                                    <div className="input-group-invent">
                                        <div className="search-wrapper">
                                            <input
                                                type="text"
                                                placeholder="Type Product Name or ID..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                            <span className="search-icon">&#9906;</span>
                                        </div>
                                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add New</button>
                                    </div>
                                </div>
                            </div>
                            <Popup
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                triggerRefresh={() => setRefresh(prev => !prev)}
                            />
                            <UpdatePopup
                                isOpen={isUpdateOpen}
                                onClose={() => setIsUpdateOpen(false)}
                                name={selectedProduct?.name}
                                quantity={selectedProduct?.quantity}
                                cost={selectedProduct?.cost}
                                id={selectedProduct?.id}
                                triggerRefresh={() => setRefresh(prev => !prev)}
                            />
                            <DeletePopup
                                isOpen={isDeleteOpen}
                                onClose={() => setIsDeleteOpen(false)}
                                name={deleteProduct?.name}
                                id={deleteProduct?.id}
                                triggerRefresh={() => setRefresh(prev => !prev)}
                            />
                            <div className="table-container">
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Product No</th>
                                            <th>Product Name</th>
                                            <th>Quantity</th>
                                            <th>Cost Price (Rs.)</th>
                                            <th>Cetagory</th>
                                            <th className="actions-header">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, index) => (
                                            <tr key={product._id}>
                                                {/* <td>#{product._id?.slice(-4)}</td> */}
                                                <td>{index + 1}</td>

                                                <td>{product.name}</td>
                                                <td>{product.quantity}</td>
                                                <td>{product.price}</td>
                                                <td>{product.category}</td>

                                                <td className="actions">
                                                    <span
                                                        className="edit-icon"
                                                        onClick={() => {
                                                            setSelectedProduct({
                                                                id: product._id,
                                                                name: product.name,
                                                                quantity: product.quantity,
                                                                cost: product.price,
                                                            });
                                                            setIsUpdateOpen(true);
                                                        }}
                                                    >
                                                        &#9998;
                                                    </span>

                                                    <span
                                                        className="delete-icon"
                                                        onClick={() => {
                                                            setDeleteProduct({
                                                                id: product._id,
                                                                name: product.name,
                                                            });
                                                            setIsDeleteOpen(true);
                                                        }}
                                                    >
                                                        &#128465;
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div> 
                    }
                </div> : <Loading />
            }
        </>
    );
}

export default Inventory;
