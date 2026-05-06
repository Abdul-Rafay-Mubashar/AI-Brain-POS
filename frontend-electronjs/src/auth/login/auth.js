import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import Login from './login';
import SignUp from './signup';
import './login.css'
const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [render, setRender] = useState(false);

    const navigate = useNavigate();


    const getMe = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setRender(true);

                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/auth/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            let data;

            try {
                data = await response.json();
            } catch (err) {
                throw new Error("Invalid server response");
            }

            if (!response.ok) {
                const message = data?.error || "Something went wrong";
                alert(message);

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    setRender(true);

                    return
                }

                setRender(true);
                return;
            }

            navigate("/");

        } catch (error) {

            alert(error.message || "Network error. Please try again.");
            setRender(true);
            navigate("/login");
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            await getMe();
        };

        fetchData();
    }, []);

    const handleChangeForm = () => {
        setIsLogin(!isLogin);
    }

    return (
        <>
            {
                render ?
                    <div className='login-complete'>
                        {
                            isLogin ?
                                <Login routeToSignUp={handleChangeForm} />
                                :
                                <SignUp routeToLogIn={handleChangeForm} />
                        }
                    </div > : null
            }
        </>
    );
};

export default Auth;