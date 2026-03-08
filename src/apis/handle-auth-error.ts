export async function handleAuthError() {
  if (typeof window !== "undefined") {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/sign-in" });
  } else {
    const { redirect } = await import("next/navigation");
    redirect("/sign-in");
  }
}
