export const RATING_GROUPS = [
  {
    key: "product",
    title: "Product Quality",
    fields: [
      { key: "quality", label: "Product quality (taste / appearance / color)" },
      { key: "compliance", label: "Compliance with specifications" },
      { key: "freshness", label: "Freshness" },
      { key: "damage", label: "Damage or spoilage level" },
      { key: "satisfaction", label: "Overall satisfaction with product" },
    ],
  },
  {
    key: "packaging",
    title: "Packaging",
    fields: [
      { key: "outer", label: "Outer packaging quality" },
      { key: "protection", label: "Product protection during shipping" },
      { key: "appearance", label: "Packaging appearance" },
      { key: "label", label: "Label clarity" },
      { key: "market", label: "Suitability for market requirements" },
    ],
  },
  {
    key: "shipping",
    title: "Shipping & Delivery",
    fields: [
      { key: "ontime", label: "On-time delivery" },
      { key: "condition", label: "Condition upon arrival" },
      { key: "carrier", label: "Shipping company performance" },
      { key: "documents", label: "Accuracy of documents" },
    ],
  },
  {
    key: "service",
    title: "Service & Communication",
    fields: [
      { key: "response", label: "Response time" },
      { key: "professionalism", label: "Professionalism" },
      { key: "resolution", label: "Problem resolution" },
      { key: "flexibility", label: "Flexibility" },
      { key: "overallService", label: "Overall service satisfaction" },
    ],
  },
] as const;

export type FeedbackEntry = {
  id: string;
  createdAt: string;
  client: {
    company: string;
    country: string;
    contact: string;
    email: string;
    orderNumber: string;
  };
  ratings: Record<string, Record<string, number>>;
  priceSuitability: "Excellent" | "Good" | "Fair" | "Poor" | "";
  overallRating: number;
  comments: {
    liked: string;
    improve: string;
    suggestions: string;
  };
  workAgain: "Yes" | "Maybe" | "No" | "";
  recommend: "Yes" | "No" | "";
};

const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").trim();
const API_URL = `${baseUrl}/feedback`;

export async function loadEntries(): Promise<FeedbackEntry[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();

    return data.map((item: any) => ({
      ...item,
      client: item.client || {
        company: item.company || "",
        country: item.country || "",
        contact: item.contact || "",
        email: item.email || "",
        orderNumber: item.orderNumber || "",
      },
      comments: item.comments || {
        liked: item.liked || "",
        improve: item.improve || "",
        suggestions: item.suggestions || "",
      }
    }));
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export async function saveEntry(entry: FeedbackEntry, userId: number) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...entry,
        userId 
      }),
    });

    if (!response.ok) throw new Error("Failed to save");
    return await response.json();
  } catch (error) {
    console.error("Save Error:", error);
    throw error;
  }
}
export async function deleteEntry(id: string) {

  try {

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete feedback");
    }

  } catch (error) {

    console.error(error);
  }
}

export function newId() {

  return `FB-${Date.now()
    .toString(36)
    .toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
}
