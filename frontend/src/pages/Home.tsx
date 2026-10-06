import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/home.css';

/* ---------------------------------- data ---------------------------------- */

type Tool = {
    id: string;
    name: string;
    blurb: string;
    detail: string;
};

const TOOLS: Tool[] = [
    {
        id: 'image',
        name: 'Image downloader',
        blurb: 'Pull every image out of a page',
        detail:
            'Paste a page and LinkCode collects the images it points to, ready to save one at a time or as a set.',
    },
    {
        id: 'custom',
        name: 'Custom link',
        blurb: 'Choose the words after the slash',
        detail:
            'Replace an anonymous string with a path of your own, so the link says where it goes before anyone taps it.',
    },
    {
        id: 'qr',
        name: 'QR code generator',
        blurb: 'Turn a URL into something scannable',
        detail:
            'A crisp QR code for any link — posters, packaging, menus or slides. Downloaded as a PNG at print size.',
    },
    {
        id: 'shortener',
        name: 'Link shortener',
        blurb: 'Compress a long URL into one you can share',
        detail:
            'Keeps the destination, drops the clutter, and hands back a short link that still reads clearly out loud.',
    },
];

const STEPS = [
    {
        n: '01',
        title: 'Paste the link',
        body: 'Any public URL goes in the field. It is parsed first, so you can see exactly what you are working with.',
    },
    {
        n: '02',
        title: 'Pick a tool',
        body: 'Decide what you want back — images, a scannable code, a shorter link, or a path of your own.',
    },
    {
        n: '03',
        title: 'Take the result',
        body: 'Copy it, download it, and keep the original beside it whenever you want to compare the two.',
    },
];

const EXAMPLES = [
    'https://example.com/articles/a-very-long-article-title',
    'https://shop.example.com/products/4821?ref=newsletter',
    'https://blog.example.com/notes/design-in-monochrome',
];

/* --------------------------------- helpers -------------------------------- */

type Parsed = { domain: string; path: string; params: [string, string][] };

function parseLink(raw: string): Parsed | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const url = new URL(candidate);
        if (!url.hostname.includes('.')) return null;
        return {
            domain: url.hostname,
            path: url.pathname || '/',
            params: [...url.searchParams.entries()],
        };
    } catch {
        return null;
    }
}

/* ---------------------------------- page ---------------------------------- */

export function HomePage() {
    const [value, setValue] = useState('');
    const [touched, setTouched] = useState(false);
    const [placeholder, setPlaceholder] = useState('');
    const [result, setResult] = useState<Parsed | null>(null);
    const [error, setError] = useState('');
    const [activeTool, setActiveTool] = useState<string>('image');
    const timers = useRef<number[]>([]);

    /* one slow typewriter placeholder — stops the moment you start typing */
    useEffect(() => {
        if (touched) return;

        const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduce) {
            setPlaceholder(EXAMPLES[0]);
            return;
        }

        let example = 0;
        let index = 0;
        let deleting = false;
        let alive = true;

        const tick = () => {
            if (!alive) return;

            const word = EXAMPLES[example];
            index += deleting ? -1 : 1;
            setPlaceholder(word.slice(0, index));

            let delay = deleting ? 26 : 62;

            if (!deleting && index === word.length) {
                deleting = true;
                delay = 2100;
            } else if (deleting && index === 0) {
                deleting = false;
                example = (example + 1) % EXAMPLES.length;
                delay = 420;
            }

            timers.current.push(window.setTimeout(tick, delay));
        };

        timers.current.push(window.setTimeout(tick, 700));

        return () => {
            alive = false;
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
    }, [touched]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        if (!touched) setTouched(true);
        if (error) setError('');
        if (result) setResult(null);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const parsed = parseLink(value);

        if (!parsed) {
            setResult(null);
            setError(
                value.trim()
                    ? 'That is not a link yet. Try example.com/page.'
                    : 'Paste a link to begin.',
            );
            return;
        }

        setError('');
        setResult(parsed);
    };

    const toggleTool = (id: string) => {
        setActiveTool((current) => (current === id ? '' : id));
    };

    return (
        <div className="home">
            {/* ------------------------------ top bar ------------------------------ */}
            <header className="home-bar">
                <Link to="/" className="home-mark" aria-label="LinkCode home">
                    Link<span>Code</span>
                </Link>

                <nav className="home-nav" aria-label="Primary">
                    <a href="#tools">Tools</a>
                    <a href="#steps">How it works</a>
                </nav>

                <div className="home-bar-actions">
                    <Link to="/login" className="home-signin">
                        Log in
                    </Link>
                    <Link to="/app" className="home-open">
                        Open the app
                    </Link>
                </div>
            </header>

            {/* -------------------------------- hero -------------------------------- */}
            <section className="home-hero">
                <h1 className="home-h1">
                    <span className="home-h1-line">Paste a link.</span>
                    <span className="home-h1-line home-h1-line--muted">
                        Do four things with it.
                    </span>
                </h1>

                <p className="home-lede">
                    Images, QR codes, short links and custom paths — one field, one press of
                    Enter. Nothing to install, and no account needed to try it.
                </p>

                <form className="home-paste" onSubmit={handleSubmit} noValidate>
                    <label className="home-visually-hidden" htmlFor="home-url">
                        Link to work on
                    </label>
                    <input
                        id="home-url"
                        className="home-paste-input"
                        type="text"
                        inputMode="url"
                        autoComplete="off"
                        spellCheck={false}
                        value={value}
                        onChange={handleChange}
                        placeholder={touched ? 'example.com/page' : placeholder}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? 'home-paste-msg' : undefined}
                    />
                    <button className="home-paste-go" type="submit" aria-label="Parse this link">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <line x1="4" y1="12" x2="19" y2="12" />
                            <polyline points="13 6 19 12 13 18" />
                        </svg>
                    </button>
                </form>

                <p
                    className={
                        'home-msg' + (error ? ' is-error' : result ? ' is-ready' : '')
                    }
                    id="home-paste-msg"
                    role="status"
                >
                    {error ||
                        (result ? 'Parsed and ready for a tool.' : 'Works with any public link.')}
                </p>

                {result && (
                    <div className="home-readout">
                        <dl className="home-readout-grid">
                            <div>
                                <dt>Domain</dt>
                                <dd>{result.domain}</dd>
                            </div>
                            <div>
                                <dt>Path</dt>
                                <dd>{result.path}</dd>
                            </div>
                            <div>
                                <dt>Query</dt>
                                <dd>
                                    {result.params.length ? (
                                        <ul className="home-chips">
                                            {result.params.map(([key, val]) => (
                                                <li key={key}>
                                                    <span>{key}</span>
                                                    {val ? `=${val}` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="home-none">none</span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                        <Link to="/app" className="home-readout-go">
                            Continue in the app
                        </Link>
                    </div>
                )}
            </section>

            <div className="home-rule" aria-hidden="true" />

            {/* -------------------------------- tools -------------------------------- */}
            <section className="home-section" id="tools">
                <div className="home-section-head">
                    <h2 className="home-h2">Four tools</h2>
                    <p className="home-section-note">
                        Select one to read what it does. Every tool takes the same field you
                        just used.
                    </p>
                </div>

                <ul className="home-rows">
                    {TOOLS.map((tool) => {
                        const open = activeTool === tool.id;
                        return (
                            <li key={tool.id} className={'home-row' + (open ? ' is-open' : '')}>
                                <button
                                    type="button"
                                    className="home-row-btn"
                                    aria-expanded={open}
                                    onClick={() => toggleTool(tool.id)}
                                >
                                    <span className="home-row-name">{tool.name}</span>
                                    <span className="home-row-blurb">{tool.blurb}</span>
                                    <span className="home-row-sign" aria-hidden="true" />
                                </button>

                                <div className="home-row-detail">
                                    <div>
                                        <p>{tool.detail}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>

            {/* -------------------------------- steps -------------------------------- */}
            <section className="home-section" id="steps">
                <div className="home-section-head">
                    <h2 className="home-h2">How it works</h2>
                </div>

                <ol className="home-steps">
                    {STEPS.map((step) => (
                        <li className="home-step" key={step.n}>
                            <span className="home-step-n">{step.n}</span>
                            <h3>{step.title}</h3>
                            <p>{step.body}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* -------------------------------- footer ------------------------------- */}
            <footer className="home-foot">
                <p className="home-foot-mark">
                    Link<span>Code</span>
                </p>
                <nav className="home-foot-nav" aria-label="Footer">
                    <Link to="/app">Open the app</Link>
                    <Link to="/signup">Create an account</Link>
                    <Link to="/login">Log in</Link>
                </nav>
                <p className="home-foot-note">
                    Built by <strong>Lavish Mehra</strong> — Developer
                    <a
                        className="home-foot-social"
                        href="https://github.com/Lavish09-Mehra"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                    <a
                        className="home-foot-social"
                        href="https://www.linkedin.com/in/lavish09dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LinkedIn
                    </a>
                    <a
                        className="home-foot-social"
                        href="mailto:developer09lavish@gmail.com"
                    >
                        Email
                    </a>
                </p>
            </footer>
        </div>
    );
}

export default HomePage;
