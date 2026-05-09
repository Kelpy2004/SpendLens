"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareAuditButton({ shareUrl }: { shareUrl: string }) {
  const [didCopy, setDidCopy] = useState(false);

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setDidCopy(true);
    window.setTimeout(() => setDidCopy(false), 1800);
  };

  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#171512] bg-white px-4 text-sm font-bold text-[#171512] shadow-sm transition hover:bg-[#f4f0e6]"
      type="button"
      onClick={copyShareUrl}
    >
      {didCopy ? (
        <Check aria-hidden className="h-4 w-4 text-[#0f8a5f]" />
      ) : (
        <Share2 aria-hidden className="h-4 w-4" />
      )}
      {didCopy ? "Copied" : "Share audit"}
      {!didCopy ? <Copy aria-hidden className="h-3.5 w-3.5" /> : null}
    </button>
  );
}

