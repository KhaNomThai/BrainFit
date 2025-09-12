export const API_URL = "https://script.google.com/macros/s/AKfycbz5MvIGCI8QozoLIE76gLL5nivZT0nz8z8LptVw7_kX-L1sR6n4sNIFM3i061vW3DUb/exec";

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
