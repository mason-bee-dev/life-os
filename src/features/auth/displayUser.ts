import type { Session, User } from "@supabase/supabase-js";

export type UserDisplay = {
  email: string;
  displayName: string;
  initials: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getUserDisplay(user: User | null | undefined): UserDisplay {
  const email = user?.email ?? "";
  const metaName = user?.user_metadata?.full_name;
  const nameFromMeta = typeof metaName === "string" ? metaName.trim() : "";
  const localPart = email.split("@")[0] ?? "";
  const displayName = nameFromMeta || localPart || "User";

  return {
    email,
    displayName,
    initials: initialsFromName(displayName),
  };
}

export function getSessionUserDisplay(session: Session | null): UserDisplay {
  return getUserDisplay(session?.user);
}
