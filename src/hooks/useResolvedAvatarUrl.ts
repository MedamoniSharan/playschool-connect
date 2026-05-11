import { useEffect, useState } from "react";
import type { User } from "@/types";
import { API_URLS } from "@/config/api";
import { parseApiResponse } from "@/lib/apiResponse";

/**
 * Resolves a displayable image URL for the signed-in user: presigned GET for `avatarS3Key`,
 * or a plain `https?://` legacy `avatar` URL.
 */
export function useResolvedAvatarUrl(user: User | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUrl(null);
      return;
    }

    const legacy = (user.avatar ?? "").trim();
    const isHttp = /^https?:\/\//i.test(legacy);

    if (!user.avatarS3Key) {
      setUrl(isHttp ? legacy : null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URLS.gallery}?action=presign_get_object`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: user.avatarS3Key }),
        });
        const raw = await res.json().catch(() => ({}));
        const data = parseApiResponse(raw);
        const readUrl = typeof data.readUrl === "string" ? data.readUrl : null;
        if (!cancelled) setUrl(readUrl || (isHttp ? legacy : null));
      } catch {
        if (!cancelled) setUrl(isHttp ? legacy : null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.avatarS3Key, user?.avatar]);

  return url;
}
