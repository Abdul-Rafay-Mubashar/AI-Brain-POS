import * as faceapi from "face-api.js";

export const loadModels = async () => {
  const MODEL_URL = process.env.PUBLIC_URL + "/models";

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
};

export const getDescriptor = async (video) => {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return Array.from(detection.descriptor);
};