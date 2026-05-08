import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/store/auth";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

type ShopDoc = {
  id: string;
  ownerUid: string;
  name: string;
  email?: string;
  description?: string;
  imageUrl?: string;
  location?: string;
};

type ProductDoc = {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
  date?: Timestamp | string | number | null;
};

const SellerDashboard = () => {
  const user = useAuth((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopDoc | null>(null);
  const [products, setProducts] = useState<ProductDoc[]>([]);

  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopImageUrl, setShopImageUrl] = useState("");
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("1");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const canCreateShop = useMemo(() => !!shopName.trim() && !!user?.uid, [shopName, user?.uid]);
  const canAddProduct = useMemo(
    () => !!shop?.id && !!name.trim() && !!price.trim() && !!category.trim() && !!subCategory.trim(),
    [shop?.id, name, price, category, subCategory]
  );

  const loadSellerData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const shopSnap = await getDocs(query(collection(db, "shops"), where("ownerUid", "==", user.uid)));
      if (!shopSnap.empty) {
        const d = shopSnap.docs[0];
        const s = { id: d.id, ...(d.data() as Omit<ShopDoc, "id">) };
        setShop(s);

        const productsSnap = await getDocs(query(collection(db, "products"), where("shopId", "==", s.id)));
        const list = productsSnap.docs.map((p) => ({ id: p.id, ...(p.data() as Omit<ProductDoc, "id">) }));
        setProducts(list);
      } else {
        setShop(null);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSellerData();
  }, [user?.uid]);

  const createShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateShop || !user?.uid) return;
    setIsCreatingShop(true);
    try {
      const created = await addDoc(collection(db, "shops"), {
        ownerUid: user.uid,
        name: shopName.trim(),
        email: user.email ?? "",
        description: shopDescription.trim(),
        imageUrl: shopImageUrl.trim(),
        location: shopLocation.trim(),
        createdAt: serverTimestamp(),
      });

      setShop({
        id: created.id,
        ownerUid: user.uid,
        name: shopName.trim(),
        email: user.email ?? "",
        description: shopDescription.trim(),
        imageUrl: shopImageUrl.trim(),
        location: shopLocation.trim(),
      });
      toast.success("Boutique créée avec succès.");
    } catch {
      toast.error("Impossible de créer la boutique.");
    } finally {
      setIsCreatingShop(false);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddProduct || !shop?.id) return;

    setIsAddingProduct(true);
    try {
      await addDoc(collection(db, "products"), {
        name: name.trim(),
        price: Number(price) || 0,
        no_price: Number(oldPrice) || 0,
        category: category.trim(),
        subCategory: subCategory.trim(),
        description: description.trim(),
        images: imageUrl.trim() ? [{ color: "default", url: imageUrl.trim() }] : [],
        filter: {},
        labeledFilters: [],
        number: Number(stock) || 0,
        stock: Number(stock) || 0,
        shopId: shop.id,
        date: serverTimestamp(),
      });

      toast.success("Produit ajouté.");
      setName("");
      setPrice("");
      setOldPrice("");
      setCategory("");
      setSubCategory("");
      setDescription("");
      setImageUrl("");
      setStock("1");
      await loadSellerData();
    } catch {
      toast.error("Impossible d'ajouter le produit.");
    } finally {
      setIsAddingProduct(false);
    }
  };

  if (loading) {
    return <div className="container py-20 text-foreground/60">Chargement de l'espace vendeur...</div>;
  }

  return (
    <div className="container py-8 md:py-12 fade-in space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-2">Vendeur</p>
        <h1 className="font-serif-display text-4xl md:text-5xl">Espace boutique</h1>
      </div>

      {!shop && (
        <section className="border border-border bg-card/60 rounded-2xl p-6 md:p-8">
          <h2 className="font-semibold text-xl mb-5">Créer ma boutique</h2>
          <form onSubmit={createShop} className="grid md:grid-cols-2 gap-4">
            <Input label="Nom de la boutique" value={shopName} onChange={setShopName} required />
            <Input label="Localisation" value={shopLocation} onChange={setShopLocation} />
            <Input label="URL logo / image" value={shopImageUrl} onChange={setShopImageUrl} className="md:col-span-2" />
            <TextArea
              label="Description"
              value={shopDescription}
              onChange={setShopDescription}
              className="md:col-span-2"
            />
            <button
              type="submit"
              disabled={!canCreateShop || isCreatingShop}
              className="md:col-span-2 mt-2 px-5 py-3 rounded-xl bg-foreground text-background text-sm font-semibold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth disabled:opacity-50"
            >
              {isCreatingShop ? "Création..." : "Créer la boutique"}
            </button>
          </form>
        </section>
      )}

      {shop && (
        <>
          <section className="border border-border bg-card/60 rounded-2xl p-6 md:p-8">
            <h2 className="font-semibold text-xl mb-3">{shop.name}</h2>
            <p className="text-sm text-foreground/65">{shop.description || "Aucune description."}</p>
            <p className="text-xs text-foreground/45 mt-2">Shop ID: {shop.id}</p>
          </section>

          <section className="border border-border bg-card/60 rounded-2xl p-6 md:p-8">
            <h2 className="font-semibold text-xl mb-5">Ajouter un produit</h2>
            <form onSubmit={addProduct} className="grid md:grid-cols-2 gap-4">
              <Input label="Nom du produit" value={name} onChange={setName} required />
              <Input label="Image URL" value={imageUrl} onChange={setImageUrl} />
              <Input label="Prix" value={price} onChange={setPrice} required type="number" />
              <Input label="Ancien prix (optionnel)" value={oldPrice} onChange={setOldPrice} type="number" />
              <Input label="Catégorie" value={category} onChange={setCategory} required />
              <Input label="Sous-catégorie" value={subCategory} onChange={setSubCategory} required />
              <Input label="Stock" value={stock} onChange={setStock} type="number" />
              <TextArea
                label="Description"
                value={description}
                onChange={setDescription}
                className="md:col-span-2"
              />

              <button
                type="submit"
                disabled={!canAddProduct || isAddingProduct}
                className="md:col-span-2 mt-2 px-5 py-3 rounded-xl bg-foreground text-background text-sm font-semibold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth disabled:opacity-50"
              >
                {isAddingProduct ? "Ajout..." : "Ajouter le produit"}
              </button>
            </form>
          </section>

          <section className="border border-border bg-card/60 rounded-2xl p-6 md:p-8">
            <h2 className="font-semibold text-xl mb-5">Mes produits ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-sm text-foreground/60">Aucun produit pour l'instant.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {products.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-4 bg-secondary/30">
                    <p className="font-medium">{p.name ?? "Sans nom"}</p>
                    <p className="text-sm text-foreground/60 mt-1">
                      {formatPrice(Number(p.price ?? 0))} • Stock: {Number(p.stock ?? 0)}
                    </p>
                    <p className="text-[11px] text-foreground/40 mt-1">ID: {p.id}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const Input = ({
  label,
  value,
  onChange,
  required,
  className,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
}) => (
  <label className={className}>
    <span className="text-[11px] uppercase tracking-wider text-foreground/50 mb-2 block">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
    />
  </label>
);

const TextArea = ({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) => (
  <label className={className}>
    <span className="text-[11px] uppercase tracking-wider text-foreground/50 mb-2 block">{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
    />
  </label>
);

export default SellerDashboard;
