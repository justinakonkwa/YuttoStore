// ─── Product (matches Firestore "products" collection) ────────────────────────

export interface ProductImage {
  color: string;
  url: string;
}

export interface ProductFilter {
  Caméra?: string;
  Couleur?: string;
  Pile?: string;
  Stockage?: string;
  "Taille écran"?: string;
  [key: string]: string | undefined;
}

export interface LabeledFilter {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;       // prix actuel
  no_price: number;    // ancien prix (barré) — champ Firestore "no_price"
  category: string;    // ex: "Phone"
  subCategory: string; // ex: "Smartphones Android"
  description: string;
  images: ProductImage[];      // [{color, url}]
  filter: ProductFilter;       // {Caméra, Couleur, Pile, Stockage, "Taille écran"}
  labeledFilters: LabeledFilter[];
  stock: number;       // quantité — champ Firestore "number"
  reference: string;   // référence produit — champ Firestore "number" (texte)
  shopId: string;
  date: string;
  mainImage: string;   // première URL d'image (calculé)
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

// ─── Filters (UI state) ───────────────────────────────────────────────────────

export interface Filters {
  categories: string[];
  subCategories: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
  sort: "newest" | "price-asc" | "price-desc" | "name-asc";
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  userId: string;
  name: string;
  number: string;
  imageUrl: string;
  fcmToken: string;
}

// ─── Order (achat_scope) ──────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  date: string;
  description: string;
  name: string;
  number: string;
  orderSnapshot: string;
  reference: string;
  status: OrderStatus;
}
