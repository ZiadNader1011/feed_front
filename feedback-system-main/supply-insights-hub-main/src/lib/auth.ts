const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").trim();
const API_URL = `${baseUrl}/auth`;

export function getStoredUser() {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (user && token) {
    try {
      return { user: JSON.parse(user), token };
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Registration failed");
  }

  return await response.json();
}

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Admin login failed");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("adminUser", JSON.stringify(data.admin));
  return data;
}

