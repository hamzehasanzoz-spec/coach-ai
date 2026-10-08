import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { currentUrl } from "@/lib/authReturnTo";

export const authQuery = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    if (!base44.auth.hasToken()) return { user: null, error: null };
    try {
      const user = await base44.auth.me();
      return { user, error: null };
    } catch (err) {
      if (err?.data?.extra_data?.reason === "user_not_registered") {
        return { user: null, error: { type: "user_not_registered", message: "طالب غير مسجل" } };
      }
      if (err?.status === 401 || err?.status === 403) return { user: null, error: null };
      throw err;
    }
  },
  staleTime: Infinity,
  retry: false,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data, error, isPending } = useQuery(authQuery);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: !!data?.user,
      isLoadingAuth: isPending,
      authError: data?.error ?? (error ? { type: "unknown", message: error.message ?? "تعذر تحميل الجلسة" } : null),
      refresh: () => queryClient.fetchQuery({ ...authQuery, staleTime: 0 }),
      logout: () => {
        queryClient.setQueryData(authQuery.queryKey, { user: null, error: null });
        base44.auth.logout(window.location.origin);
      },
      navigateToLogin: () => base44.auth.redirectToLogin(currentUrl()),
    }),
    [data, error, isPending, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth يجب أن تُستخدم داخل <AuthProvider>");
  return ctx;
}