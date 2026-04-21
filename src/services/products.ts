import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, ProductImage, LabeledFilter } from "@/types";

// ─── Firestore → Product mapper ───────────────────────────────────────────────

function docToProduct(id: string, data: Record<string, any>): Product {
  // images : tableau d'objets {color, url} ou tableau de strings
  let images: ProductImage[] = [];
  if (Array.isArray(data.images)) {
    images = data.images.map((img: any) => {
      if (typeof img === "string") return { color: "default", url: img };
      return { color: img.color ?? "default", url: img.url ?? "" };
    });
  }

  // labeledFilters : priorité au champ dédié, sinon on construit depuis filter{}
  let labeledFilters: LabeledFilter[] = [];
  if (Array.isArray(data.labeledFilters)) {
    labeledFilters = data.labeledFilters;
  } else if (data.filter && typeof data.filter === "object") {
    labeledFilters = Object.entries(data.filter)
      .filter(([, v]) => v)
      .map(([label, value]) => ({ label, value: String(value) }));
  }

  // date (Timestamp Firestore ou string)
  let date = "";
  if (data.date instanceof Timestamp) {
    date = data.date.toDate().toISOString().slice(0, 10);
  } else if (typeof data.date === "string") {
    date = data.date;
  }

  const price = Number(data.price ?? 0);

  // no_price = ancien prix barré (champ Firestore "no_price")
  // Si absent, on essaie mo_price, sinon 0 (pas de réduction)
  const no_price = Number(data.no_price ?? data.mo_price ?? 0);

  // stock = champ Firestore "number" (quantité)
  const stock = Number(data.number ?? data.stock ?? data.quantity ?? 0);

  const mainImage = images[0]?.url ?? "";

  return {
    id,
    name: data.name ?? "",
    price,
    no_price,
    category: data.category ?? "",
    subCategory: data.subCategory ?? data.sub_category ?? "",
    description: data.description ?? "",
    images,
    filter: data.filter ?? {},
    labeledFilters,
    stock,
    reference: String(data.number ?? ""),
    shopId: data.shopId ?? data.shop_id ?? "",
    date,
    mainImage,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Tous les produits, triés par date décroissante */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => docToProduct(d.id, d.data() as Record<string, any>));
    }
  } catch (err) {
    console.warn("[YuttoStore] fetchProducts error:", err);
  }
  return [];
}

/** Les N produits les plus récents */
export async function fetchFeaturedProducts(n = 8): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), orderBy("date", "desc"), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToProduct(d.id, d.data() as Record<string, any>));
  } catch (err) {
    console.warn("[YuttoStore] fetchFeaturedProducts error:", err);
    return [];
  }
}

/** Un produit par son ID Firestore */
export async function fetchProductById(id: string): Promise<Product | undefined> {
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
      return docToProduct(snap.id, snap.data() as Record<string, any>);
    }
  } catch (err) {
    console.warn("[YuttoStore] fetchProductById error:", err);
  }
  return undefined;
}

/** Catégories uniques extraites d'une liste de produits */
export function getCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
}

/** Sous-catégories uniques extraites d'une liste de produits */
export function getSubCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.subCategory).filter(Boolean))).sort();
}
