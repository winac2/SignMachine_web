
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Gesture {
  name: string;
  description: string;
}

export interface GestureResponse {
  total: number;
  gestures: Gesture[];
}

export async function getGestures(): Promise<GestureResponse> {
  const response = await fetch(`${API_URL}/api/gestures`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch gestures");
  }

  return response.json();
}


export async function createSession(
  gesture_name: string,
  contributor_name: string
) {
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gesture_name,
      contributor_name:
        contributor_name.trim() || "Prefer not to say",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface CapturedSample {
  handedness: "Left" | "Right";
  landmarks: Landmark[];
}

export async function submitSamples(
  sessionId: string,
  samples: CapturedSample[]
) {
  const response = await fetch(
    `${API_URL}/api/sessions/${sessionId}/samples`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature_schema: "mediapipe_21_xyz_v1",
        samples,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function completeSession(sessionId: string) {
  const response = await fetch(
    `${API_URL}/api/sessions/${sessionId}/complete`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}