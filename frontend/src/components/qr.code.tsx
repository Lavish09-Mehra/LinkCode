import { useEffect, useRef, useState } from "react";
import "../Styles/qr_component.css";

const QR_ENDPOINT = "http://127.0.0.1:8000/generate-qr";

type QrCodeProps = {
    url: string;
};

type Note = { tone: "ok" | "bad"; text: string };

/* keep the saved file named after what it encodes */
function fileNameFor(source: string): string {
    const clean = source.split(/[?#]/)[0];
    const last = clean.split("/").filter(Boolean).pop() ?? "";
    const slug = last
        .replace(/\.[a-z0-9]{2,5}$/i, "")
        .replace(/[^a-z0-9-_]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);

    return `qr-${slug || "code"}.png`;
}

export function QrCodeGen({ url }: QrCodeProps) {
    const source = url.trim();

    const [qr, setQr] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);
    const [note, setNote] = useState<Note | null>(null);

    const objectUrl = useRef<string | null>(null);

    /* release the last blob when we leave */
    useEffect(
        () => () => {
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        },
        [],
    );

    /* the code is generated for us, so a new link regenerates it */
    useEffect(() => {
        let cancelled = false;

        const adopt = (next: string | null) => {
            const previous = objectUrl.current;
            objectUrl.current = next;
            setQr(next);
            setLoaded(false);

            // revoke after React has committed the new source, not before
            if (previous) window.setTimeout(() => URL.revokeObjectURL(previous), 200);
        };

        setNote(null);
        setFailed(false);

        if (!source) {
            adopt(null);
            setBusy(false);
            return;
        }

        setBusy(true);

        (async () => {
            try {
                const response = await fetch(
                    `${QR_ENDPOINT}?url=${encodeURIComponent(source)}`
                );
                if (!response.ok) throw new Error(`the service replied ${response.status}`);

                const blob = await response.blob();
                if (!blob.size) throw new Error("the file came back empty");

                const blobUrl = URL.createObjectURL(blob);
                if (cancelled) {
                    URL.revokeObjectURL(blobUrl);
                    return;
                }
                adopt(blobUrl);
            } catch (err) {
                if (cancelled) return;

                const text =
                    err instanceof TypeError
                        ? "The QR service is not running. Start the Python backend on port 8000."
                        : err instanceof Error
                          ? `Could not generate it — ${err.message}.`
                          : "The code could not be generated.";

                setFailed(true);
                adopt(null);
                setNote({ tone: "bad", text });
            } finally {
                if (!cancelled) setBusy(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [source]);

    const handleDownload = () => {
        if (!qr || busy) return;

        const link = document.createElement("a");
        link.href = qr;
        link.download = fileNameFor(source);

        document.body.appendChild(link);
        link.click();
        link.remove();

        setNote({ tone: "ok", text: "Saved to your downloads folder." });
    };

    const stateLabel = !source
        ? "Waiting for a link"
        : busy
          ? "Generating"
          : failed
            ? "Failed"
            : loaded
              ? "Ready"
              : "Loading";

    return (
        <section className={"Qr_body" + (busy ? " is-busy" : "")} aria-busy={busy}>
            <div className="Qr_head">
                <h3 className="Qr_title">QR code generator</h3>
                <span className="Qr_state">{stateLabel}</span>
            </div>

            {!source ? (
                <div className="Qr_empty">
                    <p className="Qr_empty-lead">
                        Paste a link above and the code appears here.
                    </p>
                    <p className="Qr_empty-note">
                        It regenerates as you edit, so you can scan it straight off the screen.
                    </p>
                </div>
            ) : (
                <div className="Qr_layout">
                    <figure className="Qr_frame">
                        {qr && (
                            <img
                                className={loaded ? "is-loaded" : ""}
                                src={qr}
                                alt={`QR code for ${source}`}
                                onLoad={() => setLoaded(true)}
                            />
                        )}

                        {!loaded && !failed && (
                            <span className="Qr_skeleton" aria-hidden="true" />
                        )}

                        {failed && (
                            <figcaption className="Qr_broken">
                                The code could not be generated.
                            </figcaption>
                        )}
                    </figure>

                    <div className="Qr_meta">
                        <p className="Qr_label">Encodes</p>
                        <p className="Qr_source" title={source}>
                            {source}
                        </p>

                        <ul className="Qr_specs">
                            <li>PNG</li>
                            {/* matches QR_CORRECTION level M in python_backend/server.py */}
                            <li>Error correction M</li>
                        </ul>

                        <button
                            type="button"
                            className="btn_download"
                            onClick={handleDownload}
                            disabled={!qr || busy}
                        >
                            {busy ? "Generating…" : "Download PNG"}
                        </button>

                        {note && (
                            <p className={`Qr_note is-${note.tone}`}>{note.text}</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
