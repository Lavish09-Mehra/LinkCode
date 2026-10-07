import { useEffect, useState } from "react";
import "../Styles/image_componenet.css";

const DOWNLOAD_ENDPOINT = "/tools/download-image";

type ImageDownloaderProps = {
    url: string;
};

type Note = { tone: "ok" | "bad"; text: string };

/* read the extension off the link itself — real data, no guessing */
function formatFrom(source: string): string {
    const clean = source.split(/[?#]/)[0];
    const dot = clean.lastIndexOf(".");
    if (dot === -1) return "IMAGE";

    const ext = clean.slice(dot + 1).toLowerCase();
    return /^[a-z0-9]{2,5}$/.test(ext) ? ext.toUpperCase() : "IMAGE";
}

export function ImageDownloader({ url }: ImageDownloaderProps) {
    const source = url.trim();

    const [loaded, setLoaded] = useState(false);
    const [broken, setBroken] = useState(false);
    const [meta, setMeta] = useState<{ w: number; h: number } | null>(null);
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState<Note | null>(null);

    /* a new link invalidates the old preview, size and message */
    useEffect(() => {
        setLoaded(false);
        setBroken(false);
        setMeta(null);
        setBusy(false);
        setNote(null);
    }, [source]);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const image = event.currentTarget;
        setMeta({ w: image.naturalWidth, h: image.naturalHeight });
        setLoaded(true);
        setBroken(false);
    };

    const handleDownload = async () => {
        if (!source || busy) return;

        setBusy(true);
        setNote(null);

        try {
            const response = await fetch(
                `${DOWNLOAD_ENDPOINT}?url=${encodeURIComponent(source)}`
            );
            if (!response.ok) throw new Error(`the service replied ${response.status}`);

            const blob = await response.blob();
            if (!blob.size) throw new Error("the file came back empty");

            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = source.split(/[?#]/)[0].split("/").pop() || "image";

            document.body.appendChild(link);
            link.click();
            link.remove();

            // revoke after the download has actually started
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);

            setNote({ tone: "ok", text: "Saved to your downloads folder." });
        } catch (err) {
            const text =
                err instanceof TypeError
                    ? "The download service is not running. Start the Python backend on port 8000."
                    : err instanceof Error
                      ? `Could not download it — ${err.message}.`
                      : "The download did not start.";

            setNote({ tone: "bad", text });
        } finally {
            setBusy(false);
        }
    };

    const stateLabel = !source
        ? "Waiting for a link"
        : busy
          ? "Downloading"
          : broken
            ? "Preview failed"
            : loaded
              ? "Ready"
              : "Loading";

    return (
        <section
            className={"ImageDown_body" + (busy ? " is-busy" : "")}
            aria-busy={busy}
        >
            <div className="ImageDown_head">
                <h3 className="ImageDown_title">Image downloader</h3>
                <span className="ImageDown_state">{stateLabel}</span>
            </div>

            {!source ? (
                <div className="ImageDown_empty">
                    <p className="ImageDown_empty-lead">
                        Paste an image link in the field above to preview and save it.
                    </p>
                    <p className="ImageDown_empty-note">
                        Direct file links work best — anything ending in .png, .jpg or .webp.
                    </p>
                </div>
            ) : (
                <div className="ImageDown_layout">
                    <figure className="ImageDown_frame">
                        {!broken && (
                            <img
                                className={loaded ? "is-loaded" : ""}
                                src={source}
                                alt="Preview of the pasted image"
                                onLoad={handleLoad}
                                onError={() => {
                                    setBroken(true);
                                    setLoaded(false);
                                }}
                            />
                        )}

                        {!loaded && !broken && (
                            <span className="ImageDown_skeleton" aria-hidden="true" />
                        )}

                        {broken && (
                            <figcaption className="ImageDown_broken">
                                This link did not load as an image.
                            </figcaption>
                        )}
                    </figure>

                    <div className="ImageDown_meta">
                        <p className="ImageDown_label">Source</p>
                        <p className="ImageDown_source" title={source}>
                            {source}
                        </p>

                        <ul className="ImageDown_specs">
                            <li>{formatFrom(source)}</li>
                            {meta && (
                                <li>
                                    {meta.w} × {meta.h}
                                </li>
                            )}
                        </ul>

                        <button
                            type="button"
                            className="btn_download"
                            onClick={handleDownload}
                            disabled={busy}
                        >
                            {busy ? "Downloading…" : "Download image"}
                        </button>

                        {note && (
                            <p className={`ImageDown_note is-${note.tone}`}>{note.text}</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
