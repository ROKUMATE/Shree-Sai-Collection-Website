"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { clientKey, rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { appUrl, mailConfigured, sendPasswordResetEmail } from "@/lib/mail";

export type AuthFormState = { error?: string; message?: string } | undefined;

function safeNext(next: unknown): string {
  // only allow internal redirects
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export async function register(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!rateLimit(await clientKey("register"), 5, 60 * 60 * 1000)) {
    return { error: TOO_MANY };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) return { error: "Please fill in all required fields." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists. Try signing in." };

  const user = await db.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: await bcrypt.hash(password, 10),
    },
  });

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect(safeNext(formData.get("next")));
}

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!rateLimit(await clientKey("login"), 8, 10 * 60 * 1000)) {
    return { error: TOO_MANY };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Incorrect email or password." };
  }

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect(user.role === "ADMIN" ? "/admin" : safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const session = await requireSession("/account");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name) return;

  await db.user.update({
    where: { id: session.userId },
    data: { name, phone: phone || null },
  });
  // refresh the session cookie so the navbar greets with the new name
  await createSession({ ...session, name });
  revalidatePath("/account");
}

export async function changePassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await requireSession("/account");
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("new") ?? "");
  if (next.length < 6) return { error: "New password must be at least 6 characters." };

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await bcrypt.compare(current, user.password))) {
    return { error: "Current password is incorrect." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(next, 10) },
  });
  return { error: undefined };
}

// ---------- password reset ----------

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!rateLimit(await clientKey("forgot"), 3, 15 * 60 * 1000)) {
    return { error: TOO_MANY };
  }

  if (!mailConfigured()) {
    return {
      error:
        "Password reset emails are not set up on this store yet. Please contact the store owner.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await db.$transaction([
      // one active token per user
      db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      }),
    ]);
    sendPasswordResetEmail(email, `${appUrl()}/reset-password/${token}`).catch((e) =>
      console.error("reset email:", e)
    );
  }

  // identical response whether or not the account exists — no user enumeration
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function resetPassword(
  token: string,
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { password: await bcrypt.hash(password, 10) },
    }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=1");
}
