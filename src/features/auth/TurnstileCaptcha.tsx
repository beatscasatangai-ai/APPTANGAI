import { useEffect, useRef } from "react";

type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScript: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScript) return turnstileScript;

  turnstileScript = new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>("#turnstile-script");
    if (!script) {
      script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }

    script.addEventListener("load", () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("No se pudo inicializar la protección antibots."));
    }, { once: true });
    script.addEventListener("error", () => {
      script?.remove();
      turnstileScript = undefined;
      reject(new Error("No se pudo cargar la protección antibots."));
    }, { once: true });
  });

  return turnstileScript;
}

type TurnstileCaptchaProps = {
  siteKey: string;
  onToken: (token: string) => void;
  onError: (message: string) => void;
};

export default function TurnstileCaptcha({
  siteKey,
  onToken,
  onError,
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
  }, [onToken, onError]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let disposed = false;
    let widgetId: string | undefined;

    void loadTurnstile()
      .then((turnstile) => {
        if (disposed || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => {
            onTokenRef.current("");
            onErrorRef.current("No se pudo verificar el captcha. Inténtalo de nuevo.");
          },
        });
      })
      .catch((error: unknown) => {
        if (!disposed) {
          onErrorRef.current(error instanceof Error ? error.message : "Error al cargar el captcha.");
        }
      });

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) {
    return <p className="captcha-warning" role="status">Protección antibots pendiente de configurar.</p>;
  }

  return <div className="turnstile-widget" ref={containerRef} />;
}
