import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "./faceutils";  // getDescriptor hataya
import { useNavigate } from "react-router-dom";

import "./facelogin.css";

function FaceLogin() {
    const videoRef = useRef(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [blinked, setBlinked] = useState(false);
    const [enrolled, setEnrolled] = useState(false);

    const blinkCountRef = useRef(0);
    const eyesClosedRef = useRef(false);
    const closedFramesRef = useRef(0);
    const isProcessingRef = useRef(false);
    const lastDescriptorRef = useRef(null); // 👈 latest descriptor store karo

    const BLINK_THRESHOLD = 0.25;
    const MIN_CLOSED_FRAMES = 2;

    const navigate = useNavigate();

    const faceLogin = async (descriptor) => {
        try {
            if (!descriptor) {
                alert("❌ No face detected");
                return;
            }

            const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/auth/faceid-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    descriptor: Array.from(descriptor),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Login Successful");
                localStorage.setItem("token", data.token);
                navigate("/");
            } else {
                alert("❌ Face not recognized");
                window.location.reload();
            }

        } catch (error) {
            alert("❌ Server error");
        }
    };

    useEffect(() => {
        const start = async () => {
            await loadModels();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            videoRef.current.srcObject = stream;

            videoRef.current.onloadedmetadata = async () => {
                await videoRef.current.play();
                setCameraReady(true);
            };
        };

        start();
    }, []);

    const distance = (p1, p2) =>
        Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

    const eyeAspectRatio = (eye) => {
        const A = distance(eye[1], eye[5]);
        const B = distance(eye[2], eye[4]);
        const C = distance(eye[0], eye[3]);
        return (A + B) / (2.0 * C);
    };

    useEffect(() => {
        if (!cameraReady) return;

        const interval = setInterval(async () => {
            if (!videoRef.current || enrolled) return;

            // ✅ Ek hi call mein landmarks + descriptor dono
            const detection = await faceapi
                .detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 224,        // 160 se bada — better descriptor
                        scoreThreshold: 0.5,
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor(); // 👈 descriptor bhi saath mein

            if (!detection?.landmarks || !detection?.descriptor) return;

            // ✅ Har frame ka descriptor save karte raho
            lastDescriptorRef.current = detection.descriptor;

            const leftEye = detection.landmarks.getLeftEye();
            const rightEye = detection.landmarks.getRightEye();

            const avgEAR =
                (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2;

            if (avgEAR < BLINK_THRESHOLD) {
                closedFramesRef.current++;

                if (closedFramesRef.current >= MIN_CLOSED_FRAMES) {
                    eyesClosedRef.current = true;
                }
            } else {
                if (eyesClosedRef.current) {
                    blinkCountRef.current++;
                    eyesClosedRef.current = false;

                    if (blinkCountRef.current >= 1 && !isProcessingRef.current) {
                        setBlinked(true);
                        // ✅ Already captured descriptor pass karo
                        handleAutoEnroll(lastDescriptorRef.current);
                    }
                }

                closedFramesRef.current = 0;
            }
        }, 100);

        return () => clearInterval(interval);
    }, [cameraReady, enrolled]);

    // ✅ Descriptor argument se lo, getDescriptor() call nahi
    const handleAutoEnroll = async (descriptor) => {
        try {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            if (!descriptor) {
                alert("❌ Face not captured, try again");
                window.location.reload();
                return;
            }

            setEnrolled(true);
            await faceLogin(descriptor);
        } catch (err) {
            window.location.reload();
        } finally {
            isProcessingRef.current = false;
        }
    };

    return (
        <div className="face-container">
            <div className="card">

                <button className="back-btn" onClick={() => navigate(-1)}>
                    ⬅ Back
                </button>

                <h1 className="title">Face Login</h1>

                <p className="subtitle">
                    {!cameraReady && "Initializing camera..."}
                    {cameraReady && !blinked && "👁️ Please blink naturally to continue"}
                    {blinked && !enrolled && "⚡ Verifying your face..."}
                    {enrolled && "🎉 Access Granted"}
                </p>

                <div className="camera-wrapper">
                    <div className={`ring ${cameraReady ? "active" : ""}`} />

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="camera"
                    />
                </div>

                <div className="status">
                    {!cameraReady && "📷 Camera starting..."}
                    {cameraReady && !blinked && "Stay still & blink once"}
                    {blinked && !enrolled && "Processing... please wait"}
                    {enrolled && "✅ Login successful"}
                </div>

            </div>
        </div>
    );
}

export default FaceLogin;