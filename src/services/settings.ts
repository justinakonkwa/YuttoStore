import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PromoImage {
  url: string;
  url_2?: string;
  link?: string;
  link_2?: string;
  active?: boolean;
}

/**
 * Fetch promo images from app_settings > promo_image
 */
export async function fetchPromoImages(): Promise<PromoImage | null> {
  try {
    const snap = await getDoc(doc(db, "app_settings", "promo_image"));
    if (snap.exists()) {
      return snap.data() as PromoImage;
    }
  } catch (err) {
    console.warn("[YuttoStore] fetchPromoImages error:", err);
  }
  return null;
}
