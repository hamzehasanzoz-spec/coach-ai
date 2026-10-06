import { useEffect } from "react";
import { claimFounderRole } from "@/lib/server-fns";
import { useAuth } from "@/lib/AuthContext";

/**
 * The founder is the first person who registered: the first signed-in student with
 * no admin in the app yet is promoted to مدير once. Everyone else is left alone.
 */
export default function useFounderRole() {
  const { user, refresh } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user || isAdmin) return undefined;
    let cancelled = false;
    claimFounderRole()
      .then((result) => {
        if (result?.promoted && !cancelled) refresh();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id, isAdmin, refresh]);
}