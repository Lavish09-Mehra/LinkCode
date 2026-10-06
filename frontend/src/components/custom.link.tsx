import { useEffect, useState } from "react";
import "../Styles/custom_component.css";

type CustomLinkProps = {
    url: string;
};

type Note = { tone: "ok" | "bad"; text: string };

/* the snippet has to survive being pasted into a real page, so both the
   words and the URL are escaped the way HTML requires */
const escText = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escAttr = (value: string) => escText(value).replace(/"/g, "&quot;");

export function CustomLink({ url }: CustomLinkProps) {
    const source = url.trim();

    const [word, setWord] = useState("");
    const [copied, setCopied] = useState(false);
    const [note, setNote] = useState<Note | null>(null);

    /* the "Copied ✓" label reverts on its own */
    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 2200);
        return () => window.clearTimeout(id);
    }, [copied]);

    const text = word.trim();
    const snippet =
        source && text
            ? `<a href="${escAttr(source)}">${escText(text)}</a>`
            : "";

    /* typing invalidates the copy that was made from the last word —
       the URL stays, so you can retune it without retyping this one */
    const handleWord = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord(event.currentTarget.value);
        setCopied(false);
        setNote(null);
    };

    const handleCopy = async () => {
        if (!snippet) return;

        try {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            setNote({ tone: "ok", text: "Copied to your clipboard." });
        } catch {
            setNote({
                tone: "bad",
                text: "Your browser blocked clipboard access — select the code and copy it by hand.",
            });
        }
    };

    const stateLabel = !source
        ? "Waiting for a link"
        : !text
          ? "Waiting for a word"
          : "Ready";

    return (
        <section className={"Custom_body" + (text ? " is-ready" : "")}>
            <div className="Custom_head">
                <h3 className="Custom_title">Custom link</h3>
                <span className="Custom_state">{stateLabel}</span>
            </div>

            {!source ? (
                <div className="Custom_empty">
                    <p className="Custom_empty-lead">
                        Paste a URL above, then give it a word down here.
                    </p>
                    <p className="Custom_empty-note">
                        The word becomes the link text, and the HTML comes back ready to paste.
                    </p>
                </div>
            ) : (
                <div className="Custom_layout">
                    <figure className="Custom_frame">
                        {text ? (
                            <a
                                className="Custom_preview"
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {text}
                            </a>
                        ) : (
                            <span className="Custom_preview is-idle">your words</span>
                        )}

                        <code className="Custom_code">
                            {snippet || '<a href="…">…</a>'}
                        </code>

                        {!text && (
                            <figcaption className="Custom_hint">
                                Type a word to build the link.
                            </figcaption>
                        )}
                    </figure>

                    <div className="Custom_meta">
                        <p className="Custom_label">Anchor text</p>
                        <input
                            type="text"
                            className="Custom_input"
                            placeholder="Hello"
                            aria-label="Anchor text"
                            value={word}
                            onChange={handleWord}
                        />

                        <p className="Custom_sublabel">Points to</p>
                        <p className="Custom_source" title={source}>
                            {source}
                        </p>

                        <ul className="Custom_specs">
                            <li>&lt;a&gt; tag</li>
                            <li>{text ? `${text.length} chars` : "no word yet"}</li>
                        </ul>

                        <button
                            type="button"
                            className="btn_copy"
                            onClick={handleCopy}
                            disabled={!snippet}
                        >
                            {copied ? "Copied ✓" : "Copy HTML"}
                        </button>

                        {note && (
                            <p className={`Custom_note is-${note.tone}`}>{note.text}</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
