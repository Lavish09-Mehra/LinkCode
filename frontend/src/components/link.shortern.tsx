import { useEffect, useState } from "react";
import "../Styles/short_component.css";

const SHORTEN_ENDPOINT = "http://127.0.0.1:8000/shorten";

type LinkShorternProps = {
    url: string;
};

type Note = { tone: "ok" | "bad"; text: string };

type Shortened = {
    code: string;
    short: string;
    original: string;
    chars: number;
    hits: number;
};

export function LinkShortener({ url }: LinkShorternProps) {
    const source = url.trim();

    const [result, setResult] = useState<Shortened | null>(null);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);
    const [note, setNote] = useState<Note | null>(null);
    const [copied, setCopied] = useState(false);

    /* a fresh link draws a fresh code — clear the old result with it */
    useEffect(() => {
        let cancelled = false;

        setResult(null);
        setNote(null);
        setFailed(false);
        setCopied(false);

        if (!source) {
            setBusy(false);
            return;
        }

        setBusy(true);

        (async () => {
            try {
                const response = await fetch(
                    `${SHORTEN_ENDPOINT}?url=${encodeURIComponent(source)}`
                );
                if (!response.ok) throw new Error(`the service replied ${response.status}`);

                const payload: Shortened = await response.json();
                if (!payload?.code) throw new Error("the service sent no code back");

                if (cancelled) return;
                setResult(payload);
            } catch (err) {
                if (cancelled) return;

                const text =
                    err instanceof TypeError
                        ? "The shortener is not running. Start the Python backend on port 8000."
                        : err instanceof Error
                          ? `Could not shorten it — ${err.message}.`
                          : "The link could not be shortened.";

                setFailed(true);
                setNote({ tone: "bad", text });
            } finally {
                if (!cancelled) setBusy(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [source]);

    /* the "Copied ✓" label reverts on its own */
    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 2200);
        return () => window.clearTimeout(id);
    }, [copied]);

    const handleCopy = async () => {
        if (!result) return;

        try {
            await navigator.clipboard.writeText(result.short);
            setCopied(true);
            setNote({ tone: "ok", text: "Copied to your clipboard." });
        } catch {
            setNote({
                tone: "bad",
                text: "Your browser blocked clipboard access — select the link and copy it by hand.",
            });
        }
    };

    const stateLabel = !source
        ? "Waiting for a link"
        : busy
          ? "Shortening"
          : failed
            ? "Failed"
            : result
              ? "Ready"
              : "Loading";

    return (
        <section className={"Short_body" + (busy ? " is-busy" : "")} aria-busy={busy}>
            <div className="Short_head">
                <h3 className="Short_title">Link shortener</h3>
                <span className="Short_state">{stateLabel}</span>
            </div>

            {!source ? (
                <div className="Short_empty">
                    <p className="Short_empty-lead">
                        Paste a long URL above and the short link appears here.
                    </p>
                    <p className="Short_empty-note">
                        Ten digits, nothing to remember — copy it across or read it out loud.
                    </p>
                </div>
            ) : (
                <div className="Short_layout">
                    <figure className="Short_frame">
                        {result && <span className="Short_code">{result.code}</span>}

                        {result && (
                            <figcaption className="Short_link">
                                <a
                                    href={result.short}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={result.short}
                                >
                                    {result.short}
                                </a>
                            </figcaption>
                        )}

                        {!result && !failed && (
                            <span className="Short_skeleton" aria-hidden="true" />
                        )}

                        {!result && failed && (
                            <figcaption className="Short_broken">
                                The link could not be shortened.
                            </figcaption>
                        )}
                    </figure>

                    <div className="Short_meta">
                        <p className="Short_label">Original link</p>
                        <p className="Short_source" title={source}>
                            {source}
                        </p>

                        <ul className="Short_specs">
                            <li>{result ? `${result.code.length} digits` : "10 digits"}</li>
                            <li>
                                {result
                                    ? `${result.chars} → ${result.short.length} chars`
                                    : "waiting for a link"}
                            </li>
                        </ul>

                        <button
                            type="button"
                            className="btn_copy"
                            onClick={handleCopy}
                            disabled={!result || busy}
                        >
                            {copied
                                ? "Copied ✓"
                                : busy
                                  ? "Shortening…"
                                  : "Copy short link"}
                        </button>

                        {note && <p className={`Short_note is-${note.tone}`}>{note.text}</p>}
                    </div>
                </div>
            )}
        </section>
    );
}
