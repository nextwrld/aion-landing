import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onTurnstileCallback?: any;
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
  getResponse: () => string | null;
};

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
};

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript(): Promise<void> {
  // Already loaded
  if (typeof window !== "undefined" && window.turnstile) {
    return Promise.resolve();
  }

  // Already injecting
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Turnstile script load failed")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script load failed"));
    document.head.appendChild(script);
  });
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget(
    { siteKey, onToken, onExpire, onError, theme = "auto", size = "normal" },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onTokenRef.current = onToken;
    }, [onToken]);
    useEffect(() => {
      onExpireRef.current = onExpire;
    }, [onExpire]);
    useEffect(() => {
      onErrorRef.current = onError;
    }, [onError]);

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            // ignore reset errors (e.g., during HMR)
          }
        }
      },
      getResponse() {
        if (widgetIdRef.current && window.turnstile) {
          try {
            return window.turnstile.getResponse(widgetIdRef.current);
          } catch {
            return null;
          }
        }
        return null;
      },
    }));

    useEffect(() => {
      let cancelled = false;

      async function render() {
        try {
          await loadTurnstileScript();
          if (cancelled) return;
          if (!containerRef.current) return;
          if (!window.turnstile) return;
          // Avoid double-render on HMR / re-mount
          if (widgetIdRef.current) {
            try {
              window.turnstile.remove(widgetIdRef.current);
            } catch {
              // ignore
            }
            widgetIdRef.current = null;
          }
          // Clear container
          containerRef.current.innerHTML = "";
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onExpireRef.current?.(),
            "error-callback": () => onErrorRef.current?.(),
            theme,
            size,
          });
          widgetIdRef.current = id;
        } catch {
          onErrorRef.current?.();
        }
      }

      render();

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore teardown errors
          }
        }
        widgetIdRef.current = null;
      };
    }, [siteKey, theme, size]);

    return (
      <div
        ref={containerRef}
        // Reserve height to avoid layout shift (design §7)
        style={{ minHeight: "65px" }}
        aria-label="Turnstile verification widget"
      />
    );
  },
);

export default TurnstileWidget;
