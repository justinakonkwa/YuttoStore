import { useEffect, useState } from "react";
import { collectionGroup, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useUnreadChatCount(userUid?: string): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userUid) {
      setCount(0);
      return;
    }

    const q = query(
      collectionGroup(db, "messages"),
      where("idTo", "==", userUid),
      where("view", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setCount(snap.size);
    });

    return unsub;
  }, [userUid]);

  return count;
}
