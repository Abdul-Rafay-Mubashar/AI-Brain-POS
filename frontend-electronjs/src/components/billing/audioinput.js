import React, { useRef, useState } from "react";

export default function VoicePOSRecorder({ loading, getdata }) {
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const audioChunksRef = useRef([]); // ✅ FIX: useRef instead of state

    const [status, setStatus] = useState("Idle");
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // 🎤 Start Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // ✅ FORCE correct format
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = []; // reset chunks

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log("Recording stopped. Chunks:", audioChunksRef.current.length);
            };

            mediaRecorder.start();

            setIsRecording(true);
            setIsPaused(false);
            setStatus("🎙 Recording...");
        } catch (err) {
            setStatus("❌ Microphone blocked");
        }
    };

    // ⏸ Pause
    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            setStatus("⏸ Paused");
        }
    };

    // ▶ Resume
    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            setStatus("🎙 Recording...");
        }
    };

    // ⛔ Stop
    const stopRecording = () => {
        if (!mediaRecorderRef.current) return;

        mediaRecorderRef.current.stop();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
        }

        setIsRecording(false);
        setIsPaused(false);
        setStatus("⏳ Uploading...");

        setTimeout(uploadAudio, 500);
    };

    // 📤 Upload
    const uploadAudio = async () => {
        try {
            loading && loading();

            // ✅ IMPORTANT FIX HERE
            const blob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
            });

            if (!blob || blob.size === 0) {
                setStatus("❌ Empty recording");
                return;
            }

            const formData = new FormData();
            formData.append("audio", blob, "voice.webm");

            const res = await fetch(`${process.env.REACT_APP_FASTAPI_BASE_URL}/api/voice/bill`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();


            setStatus("✔ Uploaded Successfully");
            getdata(data.final)
            loading && loading();
        } catch (err) {
            setStatus("❌ Upload Failed");
        }
    };

    return (
        <div style={styles.container}>
            <h2>🎤 AI POS Voice Recorder</h2>

            <p style={styles.status}>{status}</p>

            <div style={styles.buttons}>
                {!isRecording && (
                    <button style={styles.btnGreen} onClick={startRecording}>
                        Start
                    </button>
                )}

                {isRecording && !isPaused && (
                    <button style={styles.btnYellow} onClick={pauseRecording}>
                        Pause
                    </button>
                )}

                {isRecording && isPaused && (
                    <button style={styles.btnBlue} onClick={resumeRecording}>
                        Resume
                    </button>
                )}

                {isRecording && (
                    <button style={styles.btnRed} onClick={stopRecording}>
                        Stop & Upload
                    </button>
                )}
            </div>
        </div>
    );
}

// 🎨 Styles
const styles = {
    container: {
        textAlign: "center",
        fontFamily: "Arial",
        padding: "25px",
        backgroundColor: "#2B2B2B",
        color: "white",
        border: "1px solid #3d3d3d",
        borderRadius: "10px",
        width: "300px",
        margin: "auto",
        height: "89%"
    },
    status: {
        fontWeight: "bold",
        marginBottom: "10px",
    },
    buttons: {
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    btnGreen: {
        padding: "10px",
        background: "green",
        color: "white",
        border: "none",
        borderRadius: "6px",
    },
    btnYellow: {
        padding: "10px",
        background: "orange",
        color: "white",
        border: "none",
        borderRadius: "6px",
    },
    btnBlue: {
        padding: "10px",
        background: "blue",
        color: "white",
        border: "none",
        borderRadius: "6px",
    },
    btnRed: {
        padding: "10px",
        background: "red",
        color: "white",
        border: "none",
        borderRadius: "6px",
    },
};