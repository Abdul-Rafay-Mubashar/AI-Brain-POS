export const initFaceIO = () => {
    if (!window.faceIO) {
        throw new Error("FaceIO not loaded. Check CDN script in index.html");
    }

    return new window.faceIO("fi0a971d");
};