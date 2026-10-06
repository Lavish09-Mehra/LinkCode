import { ImageDownloader } from "../components/image.downloader";
import { LinkShortener } from "../components/link.shortern";
import { CustomLink } from "../components/custom.link";
import { QrCodeGen } from "../components/qr.code";
import { ToolOutput } from "../components/tool.output";

import '../Styles/app.css';
import { useState } from 'react';

/* each tool describes itself — the paragraph follows the selected button */
const TOOL_COPY: Record<string, string> = {
    image:
        "Paste an image link above to preview it here, see its size and format, then save the file in one click.",
    custom:
        "Paste any URL above and rewrite the ending, so the link says where it leads before anyone taps it.",
    qr:
        "Paste any URL above and turn it into a scannable QR code, ready to print on posters, packaging or slides.",
    shortener:
        "Paste a long URL above and get a short link back — easy to read out loud and share anywhere.",
};

export const LinkCodeApp = () => {

    const [UrlInput, SetUrlInput] = useState("");
    /* tools read this, not the raw field — nothing reaches a tool until
       ⏎ is pressed, so typing never fires a request on every keystroke */
    const [committedUrl, setCommittedUrl] = useState("");
    const [activeTool, setActiveTool] = useState("image");

    const handleInputUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
        SetUrlInput(event.currentTarget.value);
    };

    const handleAppSwitch = (tool: string) => {
        setActiveTool(tool);
    }

    const handleSubmit = () => {
        const next = UrlInput.trim();
        if (next === "") return alert("Enter a URL")

        setCommittedUrl(next);
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        handleSubmit();
    };

    /* a link is typed but not applied yet — this is what lights the button */
    const isPending = UrlInput.trim() !== "" && UrlInput.trim() !== committedUrl;

    return (
        <div className="main-app">
            <div className="headers">
                <h1 className="h1-headers">LinkCode — Your All-in-One Link Toolkit</h1>
                <p className="p-headers">Download media, shorten URLs, and generate QR codes — fast, free, and secure.</p>

                <div className="switches-headers">
                    <button
                        onClick={() => handleAppSwitch("image")}
                        className={"link-downloader" + (activeTool === "image" ? " active" : "")}
                    >
                        Image Downloader
                    </button>

                    <button
                        onClick={() => handleAppSwitch("custom")}
                        className={"link-custom" + (activeTool === "custom" ? " active" : "")}
                    >
                        Custom Link Generator
                    </button>

                    <button
                        onClick={() => handleAppSwitch("qr")}
                        className={"link-qr" + (activeTool === "qr" ? " active" : "")}
                    >
                        QR Code Generator
                    </button>

                    <button
                        onClick={() => handleAppSwitch("shortener")}
                        className={"link-shortern" + (activeTool === "shortener" ? " active" : "")}
                    >
                        Link shortener
                    </button>
                </div>

                <div className="Input-box">
                    <input type="url" className="inp-main" placeholder="Paste Link here" value={UrlInput} onChange={handleInputUrl} onKeyDown={handleInputKeyDown} />

                    <button onClick={handleSubmit} className={"btn-submit" + (isPending ? " is-pending" : "")} aria-label="Apply link">⏎</button>
                </div>
            </div>

            <div className="main-inputBody">
                <h2 className="p-inst">
                    <strong className="app-titleName">LinkCode </strong>
                    {TOOL_COPY[activeTool] ?? TOOL_COPY.image}
                </h2>

                <div className="main-inputBody">

                    <ToolOutput stamp={`${activeTool}:${committedUrl}`}>
                        {activeTool === "image" && (
                            <ImageDownloader url={committedUrl} />
                        )}

                        {activeTool === "custom" && (
                            <CustomLink url={committedUrl} />
                        )}

                        {activeTool === "qr" && (
                            <QrCodeGen url={committedUrl} />
                        )}

                        {activeTool === "shortener" && (
                            <LinkShortener url={committedUrl} />
                        )}
                    </ToolOutput>

                </div>

            </div>
        </div>
    );
}
