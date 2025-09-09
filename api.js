export const API_URL = "https://script.google.com/macros/s/AKfycbzatsGErbjy7qIGzximYt7AHGSfj-vZ0FHs2mcXgtnhIudHt16sBx1kG2ZzWWXIL-8h/exec";

export const post = async (payload) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text || "Server error" };
  }
};

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
