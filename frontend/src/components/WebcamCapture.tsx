"use client";

import { useEffect, useRef, useState } from "react";
import {useLanguage} from "@/contexts/LanguageContext";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

import {
  createSession,
  submitSamples,
  completeSession,
  type CapturedSample,
} from "@/lib/api";

interface Props {
  gestureName: string;
  contributorName: string;
}

const API_BATCH_SIZE = 30;
const CAPTURE_INTERVAL = 150;

export default function WebcamCapture({
  gestureName,
  contributorName,
}: Props) {
  const {t} = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const bufferRef = useRef<CapturedSample[]>([]);
  const collectingRef = useRef(false);
  const uploadingRef = useRef(false);
  const lastCaptureRef = useRef(0);
  const sessionIdRef = useRef("");

  const [cameraOn, setCameraOn] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [status, setStatus] = useState(t.capture.offcam);
  const [error, setError] = useState("");

  // ----------------------------------
  // Upload buffered samples
  // ----------------------------------
  // const {t} = useLanguage();
  
  async function flushBatch() {
  if (uploadingRef.current || !sessionIdRef.current) {
    return;
  }

  uploadingRef.current = true;

  try {
    while (bufferRef.current.length > 0) {
      const batch = bufferRef.current.splice(
        0,
        API_BATCH_SIZE
      );

      try {
        await submitSamples(sessionIdRef.current, batch);

        setSampleCount((count) => count + batch.length);
      } catch (err) {
        bufferRef.current.unshift(...batch);

        setError(
          err instanceof Error ? err.message : "Upload failed"
        );

        break;
      }
    }
  } finally {
    uploadingRef.current = false;
  }
}

  // ----------------------------------
  // Initialize MediaPipe
  // ----------------------------------

  async function initializeLandmarker() {
    if (landmarkerRef.current) {
      return landmarkerRef.current;
    }

    setStatus("Loading MediaPipe model...");

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const landmarker = await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      }
    );

    landmarkerRef.current = landmarker;

    return landmarker;
  }

  // ----------------------------------
  // Start camera
  // ----------------------------------

  async function startCamera() {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser does not support webcam access.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        throw new Error("Video element not found.");
      }

      video.srcObject = stream;
      await video.play();

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2){
            resolve();
        } else {
            video.onloadeddata = () => resolve();
        }

      });

      await initializeLandmarker();

      setCameraOn(true);
      setStatus("Camera ready");

      renderLoop();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cannot start camera"
      );

      stopCamera();
    }
  }

  // ----------------------------------
  // Process camera frames
  // ----------------------------------


  function renderLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker) {
        return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
    ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const now = performance.now();

        try {
        const result = landmarker.detectForVideo(video, now);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const hand = result.landmarks[0];

        if (hand && hand.length === 21) {
            ctx.fillStyle = "#22c55e";

            for (const point of hand) {
            ctx.beginPath();
            ctx.arc(
                point.x * canvas.width,
                point.y * canvas.height,
                5,
                0,
                Math.PI * 2
            );
            ctx.fill();
            }

            if (
            collectingRef.current &&
            now - lastCaptureRef.current >= CAPTURE_INTERVAL
            ) {
            lastCaptureRef.current = now;

            const handedness =
                result.handedness?.[0]?.[0]?.categoryName;

            if (
                handedness === "Left" ||
                handedness === "Right"
            ) {
                const sample: CapturedSample = {
                handedness,
                landmarks: hand.map((point) => ({
                    x: point.x,
                    y: point.y,
                    z: point.z,
                })),
                };

                bufferRef.current.push(sample);

                if (bufferRef.current.length >= API_BATCH_SIZE) {
                void flushBatch();
                }
            }
            }
        }
        } catch (err) {
        console.error("MediaPipe detectForVideo error:", err);

        setError(
            err instanceof Error
            ? err.message
            : "MediaPipe detection failed"
        );

        setStatus("MediaPipe processing error");
        return;
        }
    }

    animationRef.current = requestAnimationFrame(renderLoop);
    }

  // ----------------------------------
  // Start collection
  // ----------------------------------

  async function startCollection() {
    try {
      setError("");

      if (!cameraOn) {
        throw new Error("Please turn on the camera first.");
      }

      const session = await createSession(
        gestureName,
        contributorName || "Prefer not to say"
      );

      sessionIdRef.current = session.session_id;

      bufferRef.current = [];
      setSampleCount(0);

      collectingRef.current = true;
      setCollecting(true);
      setStatus("Collecting landmarks...");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cannot start collection"
      );
    }
  }

  // ----------------------------------
  // Stop collection
  // ----------------------------------


  async function stopCollection() {
    collectingRef.current = false;
    setCollecting(false);

    setStatus("Uploading remaining samples...");

    await flushBatch();

    // Chỉ hoàn tất session nếu buffer đã được gửi hết
    if (bufferRef.current.length === 0 && sessionIdRef.current) {
        try {
        await completeSession(sessionIdRef.current);
        setStatus("Collection completed");
        } catch (err) {
        setError(
            err instanceof Error ? err.message : "Cannot complete session"
        );
        setStatus("Session completion failed");
        }
    } else {
        setStatus("Upload incomplete - please retry");
    }
}




  // ----------------------------------
  // Stop camera and cleanup
  // ----------------------------------

  function stopCamera() {
    collectingRef.current = false;
    setCollecting(false);

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setStatus("Camera is off");
  }

  useEffect(() => {
    return () => {
      collectingRef.current = false;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  return (
    
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{t.capture.selectedGesture}</p>
          <h2 className="text-2xl font-semibold">{gestureName}</h2>
          <p className="text-sm text-gray-400">
            {t.contribute.contributor}: {contributorName || t.contribute.defaultName}
          </p>
        </div>

        <div className="text-sm text-gray-400">
          {status}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block w-full -scale-x-100"
        />

        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {!cameraOn ? (
          <button
            onClick={startCamera}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium"
          >
            {t.capture.startCamera}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            disabled={collecting}
            className="rounded-lg bg-gray-700 px-5 py-3 font-medium disabled:opacity-40"
          >
            {t.capture.stopCamera}
          </button>
        )}

        {!collecting ? (
          <button
            onClick={startCollection}
            disabled={!cameraOn || !consent}
            className="rounded-lg bg-green-600 px-5 py-3 font-medium disabled:opacity-40"
          >
            {t.capture.startCollection}
          </button>
        ) : (
          <button
            onClick={stopCollection}
            className="rounded-lg bg-red-600 px-5 py-3 font-medium"
          >
            {t.capture.stopCollection}
          </button>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={collecting}
          className="mt-1"
        />
        <span>
          {t.capture.agreement}
        </span>
      </label>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="text-sm text-gray-400">{t.capture.upedsample}</p>
        <p className="text-3xl font-bold">{sampleCount}</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}