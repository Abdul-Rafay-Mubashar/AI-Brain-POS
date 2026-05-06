let blinkCount = 0;
let lastEyeOpen = true;
let movementHistory = [];

export const resetLiveness = () => {
  blinkCount = 0;
  movementHistory = [];
};

const isEyeOpen = (eye) => {
  const vertical = Math.abs(eye[1].y - eye[5].y);
  const horizontal = Math.abs(eye[0].x - eye[3].x);
  return vertical / horizontal > 0.25;
};

export const detectLiveness = async (faceapi, video) => {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (!detection) return { valid: false };

  const landmarks = detection.landmarks;

  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  const eyeOpen = isEyeOpen(leftEye) && isEyeOpen(rightEye);

  if (lastEyeOpen && !eyeOpen) {
    blinkCount++;
  }

  lastEyeOpen = eyeOpen;

  const nose = landmarks.getNose()[0];

  movementHistory.push(nose.x);
  if (movementHistory.length > 10) movementHistory.shift();

  const movement =
    Math.max(...movementHistory) - Math.min(...movementHistory);

  return {
    valid: blinkCount >= 1 && movement > 15,
    blinkCount,
    movement,
  };
};