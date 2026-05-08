import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type AuthError,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  // actions
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      loginWithEmail: async (email, password) => {
        set({ loading: true });
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } finally {
          set({ loading: false });
        }
      },

      registerWithEmail: async (email, password, displayName) => {
        set({ loading: true });
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName });
        } finally {
          set({ loading: false });
        }
      },

      loginWithGoogle: async () => {
        set({ loading: true });
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          await signInWithPopup(auth, provider);
        } catch (error) {
          const authError = error as AuthError;
          // Fallback utile sur Safari/iOS ou quand la popup est bloquée.
          if (
            authError.code === "auth/popup-blocked" ||
            authError.code === "auth/cancelled-popup-request" ||
            authError.code === "auth/operation-not-supported-in-this-environment"
          ) {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            await signInWithRedirect(auth, provider);
            return;
          }
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        await signOut(auth);
        set({ user: null });
      },
    }),
    {
      name: "yutto-auth",
      // Ne persiste que les infos de base de l'utilisateur (pas les fonctions)
      partialize: (state) => ({
        user: state.user
          ? {
              uid: state.user.uid,
              email: state.user.email,
              displayName: state.user.displayName,
              photoURL: state.user.photoURL,
            }
          : null,
      }),
    }
  )
);

/**
 * Initialise l'écouteur Firebase Auth.
 * À appeler une seule fois au démarrage de l'app.
 */
export function initAuthListener() {
  const { setUser, setInitialized } = useAuth.getState();

  void getRedirectResult(auth).catch(() => {
    // Les erreurs seront gérées à l'action login; ne pas bloquer l'init.
  });

  return onAuthStateChanged(auth, (user) => {
    setUser(user);
    setInitialized(true);
  });
}
