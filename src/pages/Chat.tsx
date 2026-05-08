import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  doc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { formatPrice } from "@/lib/currency";

type ChatThread = {
  id: string;
  userUid?: string;
  userName?: string;
  userPicUrl?: string;
  shopUid?: string;
  shopName?: string;
  shopPicUrl?: string;
  lastMessage?: string;
  createdAt?: Timestamp | string | number | null;
  updatedAt?: Timestamp | string | number | null;
};

type ChatMessage = {
  id: string;
  message?: string;
  type?: string;
  imageUrl?: string;
  view?: boolean;
  userUid?: string;
  idFrom?: string;
  idTo?: string;
  createdAt?: Timestamp | string | number | null;
};

type TaggedProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  reference: string;
  shopId: string;
};

function toDate(input: unknown): Date | null {
  if (!input) return null;
  if (typeof input === "object" && input !== null && "toDate" in input) {
    return (input as Timestamp).toDate();
  }
  if (typeof input === "number") return new Date(input);
  if (typeof input === "string") {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatTime(input: unknown): string {
  const d = toDate(input);
  if (!d) return "--:--";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const Chat = () => {
  const location = useLocation();
  const user = useAuth((s) => s.user);
  const taggedProduct = (location.state as { taggedProduct?: TaggedProduct } | null)?.taggedProduct;
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoadingThreads(true);

    const chatsRef = collection(db, "chats");
    const qUser = query(chatsRef, where("userUid", "==", user.uid));
    const qShop = query(chatsRef, where("shopUid", "==", user.uid));

    let fromUser: ChatThread[] = [];
    let fromShop: ChatThread[] = [];

    const pushThreads = () => {
      const merged = [...fromUser, ...fromShop];
      const dedup = new Map<string, ChatThread>();
      merged.forEach((t) => dedup.set(t.id, t));

      const sorted = Array.from(dedup.values()).sort((a, b) => {
        const aDate = toDate(a.updatedAt ?? a.createdAt)?.getTime() ?? 0;
        const bDate = toDate(b.updatedAt ?? b.createdAt)?.getTime() ?? 0;
        return bDate - aDate;
      });

      setThreads(sorted);
      setIsLoadingThreads(false);
    };

    const unsubUser = onSnapshot(qUser, (snap) => {
      fromUser = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatThread, "id">) }));
      pushThreads();
    });

    const unsubShop = onSnapshot(qShop, (snap) => {
      fromShop = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatThread, "id">) }));
      pushThreads();
    });

    return () => {
      unsubUser();
      unsubShop();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const messagesRef = collection(db, "chats", selectedThreadId, "messages");
    const unsub = onSnapshot(messagesRef, (snap) => {
      const unreadForMe = snap.docs.filter((d) => {
        const data = d.data() as Omit<ChatMessage, "id">;
        return data.idTo === user?.uid && data.view === false;
      });

      if (unreadForMe.length > 0) {
        const batch = writeBatch(db);
        unreadForMe.forEach((d) => batch.update(d.ref, { view: true }));
        void batch.commit();
      }

      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, "id">) }));
      list.sort((a, b) => {
        const aDate = toDate(a.createdAt)?.getTime() ?? 0;
        const bDate = toDate(b.createdAt)?.getTime() ?? 0;
        return aDate - bDate;
      });
      setMessages(list);
      setIsLoadingMessages(false);
    });

    return unsub;
  }, [selectedThreadId, user?.uid]);

  useEffect(() => {
    if (!selectedThreadId && threads.length > 0) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  useEffect(() => {
    if (!user?.uid || !taggedProduct || !taggedProduct.shopId) return;

    const openOrCreateThread = async () => {
      try {
        const chatsRef = collection(db, "chats");
        const q = query(
          chatsRef,
          where("userUid", "==", user.uid),
          where("shopUid", "==", taggedProduct.shopId)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          setSelectedThreadId(snap.docs[0].id);
        } else {
          const created = await addDoc(chatsRef, {
            userUid: user.uid,
            userName: user.displayName ?? user.email ?? "Utilisateur",
            userPicUrl: user.photoURL ?? "",
            shopUid: taggedProduct.shopId,
            shopName: "Vendeur",
            shopPicUrl: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: "",
          });
          setSelectedThreadId(created.id);
        }

        if (!messageText.trim()) {
          setMessageText(
            `Bonjour, je suis intéressé par ce produit: ${taggedProduct.name} (Réf: ${taggedProduct.reference || taggedProduct.id}).`
          );
        }
      } catch {
        toast.error("Impossible d'ouvrir la conversation du produit.");
      }
    };

    void openOrCreateThread();
  }, [messageText, taggedProduct, user?.displayName, user?.email, user?.photoURL, user?.uid]);

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId),
    [threads, selectedThreadId]
  );

  const threadTitle = useMemo(() => {
    if (!selectedThread) return "Conversation";
    if (selectedThread.userUid === user?.uid) return selectedThread.shopName ?? "Boutique";
    return selectedThread.userName ?? "Client";
  }, [selectedThread, user?.uid]);

  const getOtherPartyLabel = () => {
    if (!selectedThread || !user?.uid) return "Interlocuteur";
    if (selectedThread.userUid === user.uid) return selectedThread.shopName ?? "Vendeur";
    return selectedThread.userName ?? "Client";
  };

  const sendMessage = async () => {
    if (!selectedThread || !user?.uid || !messageText.trim()) return;

    setIsSending(true);
    try {
      const clean = messageText.trim();
      const targetUid =
        selectedThread.userUid === user.uid ? selectedThread.shopUid ?? "" : selectedThread.userUid ?? "";

      await addDoc(collection(db, "chats", selectedThread.id, "messages"), {
        chatUid: selectedThread.id,
        message: clean,
        type: "text",
        view: false,
        idFrom: user.uid,
        idTo: targetUid,
        userUid: user.uid,
        userName: user.displayName ?? user.email ?? "Utilisateur",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", selectedThread.id), {
        lastMessage: clean,
        updatedAt: serverTimestamp(),
      });

      setMessageText("");
    } catch {
      toast.error("Impossible d'envoyer le message.");
    } finally {
      setIsSending(false);
    }
  };

  const createSupportConversation = async () => {
    if (!user?.uid) return;

    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("userUid", "==", user.uid), where("shopUid", "==", "support"));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setSelectedThreadId(snap.docs[0].id);
        return;
      }

      const created = await addDoc(chatsRef, {
        userUid: user.uid,
        userName: user.displayName ?? user.email ?? "Utilisateur",
        userPicUrl: user.photoURL ?? "",
        shopUid: "support",
        shopName: "Support",
        shopPicUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "",
      });

      setSelectedThreadId(created.id);
      toast.success("Conversation créée.");
    } catch {
      toast.error("Impossible de créer une conversation.");
    }
  };

  return (
    <div className="container py-6 md:py-10 fade-in">
      <div className="mb-6 md:mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-2">Support</p>
        <h1 className="font-serif-display text-4xl md:text-5xl">Messages</h1>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5 min-h-[65vh]">
        <aside className="border border-border rounded-2xl bg-card/70 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Conversations</p>
          </div>

          <div className="max-h-[55vh] overflow-y-auto">
            {isLoadingThreads ? (
              <div className="p-6 text-sm text-foreground/60 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
              </div>
            ) : threads.length === 0 ? (
              <div className="p-6 space-y-4">
                <p className="text-sm text-foreground/55">Aucune conversation pour le moment.</p>
                <button
                  type="button"
                  onClick={() => void createSupportConversation()}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-smooth"
                >
                  Démarrer une conversation
                </button>
              </div>
            ) : (
              threads.map((thread) => {
                const active = thread.id === selectedThreadId;
                const label = thread.userUid === user?.uid ? thread.shopName : thread.userName;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border/60 transition-smooth",
                      active ? "bg-accent/10" : "hover:bg-secondary/40"
                    )}
                  >
                    <p className="text-sm font-medium truncate">{label ?? "Conversation"}</p>
                    <p className="text-xs text-foreground/50 truncate mt-0.5">
                      {thread.lastMessage ?? "Aucun message"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="border border-border rounded-2xl bg-card/70 flex flex-col min-h-[65vh]">
          <header className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 grid place-items-center">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold">{threadTitle}</p>
              <p className="text-xs text-foreground/50">Messagerie en temps réel</p>
            </div>
          </header>

          <div className="flex-1 p-5 space-y-3 overflow-y-auto">
            {!selectedThreadId ? (
              <p className="text-sm text-foreground/55">Sélectionnez une conversation.</p>
            ) : isLoadingMessages ? (
              <p className="text-sm text-foreground/55 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement des messages...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-foreground/55">Aucun message dans cette conversation.</p>
            ) : (
              messages.map((m) => {
                const mine = m.idFrom === user?.uid || m.userUid === user?.uid;
                const senderLabel = mine ? "Vous" : getOtherPartyLabel();
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className="max-w-[85%] md:max-w-[70%]">
                      <p
                        className={cn(
                          "text-[11px] mb-1 px-1",
                          mine ? "text-accent text-right" : "text-foreground/55 text-left"
                        )}
                      >
                        {senderLabel}
                      </p>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3",
                          mine
                            ? "bg-accent text-accent-foreground rounded-br-sm"
                            : "bg-secondary text-foreground rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{m.message ?? ""}</p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            mine ? "text-accent-foreground/75 text-right" : "text-foreground/45 text-left"
                          )}
                        >
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <footer className="p-4 border-t border-border">
            {taggedProduct && (
              <div className="mb-3 border border-border rounded-xl p-3 bg-secondary/40 flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-background shrink-0">
                  {taggedProduct.imageUrl ? (
                    <img
                      src={taggedProduct.imageUrl}
                      alt={taggedProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-accent">Produit lié</p>
                  <p className="text-sm font-semibold truncate">{taggedProduct.name}</p>
                  <p className="text-xs text-foreground/55">
                    {formatPrice(taggedProduct.price)}
                    {taggedProduct.reference ? ` • Réf. ${taggedProduct.reference}` : ""}
                  </p>
                </div>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={!selectedThreadId || isSending}
              />
              <button
                type="submit"
                disabled={!selectedThreadId || !messageText.trim() || isSending}
                className="h-11 w-11 rounded-xl bg-foreground text-background grid place-items-center hover:bg-accent hover:text-accent-foreground transition-smooth disabled:opacity-50"
                aria-label="Envoyer le message"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default Chat;
