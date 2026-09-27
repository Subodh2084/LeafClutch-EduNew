import { ArrowUpRight, CircleCheck } from "lucide-react";

import type { EnrollmentChannel } from "@/lib/enrollment";

export interface Handoff {
  channel: EnrollmentChannel;
  url: string;
}

/**
 * Live-region confirmation shown after a form hands off to WhatsApp or the
 * mail app, with a retry link in case the app didn't open.
 */
export function HandoffNotice({ sent, detail }: { sent: Handoff | null; detail: string }) {
  return (
    <div role="status" aria-live="polite">
      {sent && (
        <div className="mt-5 flex gap-3 rounded-lg border border-green/40 bg-green/10 p-4 text-sm text-foreground">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-navy" />
          <div>
            <p className="font-medium">
              {sent.channel === "whatsapp" ? "WhatsApp" : "Your email app"} should now be open with{" "}
              {detail}.
            </p>
            <p className="mt-1 text-muted-foreground">
              Send the message there to complete your request.{" "}
              <a
                href={sent.url}
                target={sent.channel === "whatsapp" ? "_blank" : undefined}
                rel={sent.channel === "whatsapp" ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-0.5 font-medium text-navy underline underline-offset-4"
              >
                Didn’t open? Try again
                {sent.channel === "whatsapp" && (
                  <>
                    <ArrowUpRight aria-hidden className="size-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </>
                )}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
