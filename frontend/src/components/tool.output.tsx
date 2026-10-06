import { useEffect, useState } from "react";
import { BanterLoader } from "./loader";

/* every tool output arrives behind the same beat: the loader covers the
   panel for exactly 1.09s, then the real content takes over */
const SHOW_FOR_MS = 1090;

type ToolOutputProps = {
    /** re-mounts the beat whenever the tool or the applied link changes */
    stamp: string;
    children: React.ReactNode;
};

export function ToolOutput({ stamp, children }: ToolOutputProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(false);

        const id = window.setTimeout(() => setReady(true), SHOW_FOR_MS);
        return () => window.clearTimeout(id);
    }, [stamp]);

    if (!ready) {
        return (
            <div className="tool-output is-loading">
                <BanterLoader />
            </div>
        );
    }

    return <div className="tool-output">{children}</div>;
}
