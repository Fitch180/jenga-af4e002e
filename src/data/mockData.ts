export const CATEGORIES = [
  "All",
  "ARCHITECTS",
  "ENGINEERS",
  "CONTRACTORS",
  "BUILDING",
  "PLUMBING",
  "FLOORING",
  "ELECTRICAL",
  "PAINTING",
  "TILES",
  "FURNITURE",
  "LIGHTING",
  "DECOR",
  "GARDENING",
  "REPAIR",
];

// Service-oriented categories (merchants offering services, not products)
export const SERVICE_CATEGORIES = [
  "ARCHITECTS",
  "ENGINEERS",
  "CONTRACTORS",
  "LANDSCAPING",
  "PLUMBERS",
  "PAINTERS",
];

// Empty arrays - real data will come from the database
export const MERCHANTS: { id: number; name: string; location: string; category: string; image: string }[] = [];

export const PRODUCTS: { id: string; merchantId: number; name: string; merchant: string; price: string; category: string; image: string; itemType?: "product" | "service" }[] = [];

// Service data structure for when database tables are created
export const SERVICES: { id: string; merchantId: number; name: string; merchant: string; price: string; category: string; image: string; description: string; itemType?: "product" | "service" }[] = [];
