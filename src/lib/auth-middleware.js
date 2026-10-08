import { createClientFromRequest, getAccessToken } from "@base44/sdk";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";

const withGetBase44 = (next, request = getRequest()) => {
  let client;
  return next({ context: { getBase44: () => (client ??= createClientFromRequest(request)) } });
};

export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const token = typeof window === "undefined" ? null : getAccessToken();
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  })
  .server(({ next }) => withGetBase44(next));

export const base44RequestMiddleware = createMiddleware({ type: "request" }).server(({ next, request }) =>
  withGetBase44(next, request),
);

const currentUser = async (context) => {
  try {
    return await context.getBase44().auth.me();
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) return null;
    throw error;
  }
};

export const requireUser = createMiddleware({ type: "function" }).server(async ({ next, context }) => {
  const user = await currentUser(context);
  if (!user) {
    setResponseStatus(401);
    throw Object.assign(new Error("غير مصرح بالوصول"), { status: 401, code: "UNAUTHORIZED" });
  }
  return next({ context: { user } });
});

export const requireUserRoute = createMiddleware({ type: "request" }).server(async ({ next, context }) => {
  const user = await currentUser(context);
  if (!user) return Response.json({ error: "غير مصرح بالوصول" }, { status: 401 });
  return next({ context: { user } });
});