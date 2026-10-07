from datetime import datetime, timezone
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse, Response
import io
import secrets
import sqlite3

import httpx
import qrcode
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/tools/download-image")
async def download_image(url: str):

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    return Response(
        content=response.content,
        media_type=response.headers.get("content-type", "image/jpeg"),
        headers={
            "Content-Disposition": "attachment; filename=image.jpg"
        }
    )


# Error correction level M recovers 15% of damaged modules — the usual
# choice for URLs. The chip in qr.code.tsx says "Error correction M";
# change one, change the other.
@app.get("/tools/generate-qr")
async def generate_qr(url: str):

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,  # spec-quiet zone: 4 modules, not 2 — keeps strict scanners happy
    )
    qr.add_data(url)
    qr.make(fit=True)

    # #242424 is LinkCode's ink, so the code matches the app while still
    # sitting at maximum contrast against white for the scanner
    image = qr.make_image(fill_color="#242424", back_color="#ffffff")

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")

    return Response(
        content=buffer.getvalue(),
        media_type="image/png",
        headers={
            "Content-Disposition": 'inline; filename="qrcode.png"'
        },
    )


# ------------------------------------------------------------------
# Link shortener
# ------------------------------------------------------------------
# The short link is built from whatever host the request arrived on, so
# it resolves the moment the server starts — no hardcoded domain to get
# wrong. To pin one canonical address later, return "https://your-domain/"
# + code below instead; stored links keep working either way, because only
# the prefix moves.

# 10 digits as specified. Widen to string.ascii_letters + digits if you
# ever want more than 10^10 possible codes.
CODE_LENGTH = 10
CODE_ALPHABET = "0123456789"

# lives next to server.py, survives a restart — a short link that stops
# working when the server bounces is the one thing a shortener must not do.
# Deployed on Vercel the bundle is read-only, so the store moves to /tmp,
# which is the one writable location a function has.
DB_PATH = (
    Path("/tmp/links.db") if os.environ.get("VERCEL") else Path(__file__).with_name("links.db")
)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS links (
            code     TEXT PRIMARY KEY,
            original TEXT NOT NULL UNIQUE,
            hits     INTEGER NOT NULL DEFAULT 0,
            created  TEXT NOT NULL
        )
        """
    )
    return conn


def _new_code() -> str:
    return "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))


@app.get("/tools/shorten")
async def shorten(url: str, request: Request):

    original = url.strip()
    if not original:
        return JSONResponse(status_code=400, content={"detail": "the url is empty"})

    conn = _connect()
    try:
        # UNIQUE(original) makes this idempotent: shortening the same link
        # twice hands back the same code instead of burning a new one
        row = conn.execute(
            "SELECT code FROM links WHERE original = ?", (original,)
        ).fetchone()
        code = row[0] if row else None

        if code is None:
            for _ in range(8):  # redraw on the (vanishingly rare) collision
                candidate = _new_code()
                try:
                    conn.execute(
                        "INSERT INTO links (code, original, created) VALUES (?, ?, ?)",
                        (
                            candidate,
                            original,
                            datetime.now(timezone.utc).isoformat(timespec="seconds"),
                        ),
                    )
                    conn.commit()
                    code = candidate
                    break
                except sqlite3.IntegrityError:
                    continue
            else:
                return JSONResponse(
                    status_code=500, content={"detail": "could not allocate a code"}
                )

        row = conn.execute("SELECT hits FROM links WHERE code = ?", (code,)).fetchone()
        hits = row[0] if row else 0
    finally:
        conn.close()

    return JSONResponse(
        content={
            "code": code,
            "short": str(request.base_url) + code,
            "original": original,
            "chars": len(original),
            "hits": hits,
        }
    )


# Registered last on purpose: Starlette matches top-down, so /docs,
# /download-image, /generate-qr and /shorten all win over this.
@app.get("/{code}")
async def resolve(code: str):

    if not (code.isdigit() and len(code) == CODE_LENGTH):
        raise HTTPException(status_code=404, detail="not a LinkCode code")

    conn = _connect()
    try:
        row = conn.execute(
            "SELECT original FROM links WHERE code = ?", (code,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="unknown code")

        conn.execute("UPDATE links SET hits = hits + 1 WHERE code = ?", (code,))
        conn.commit()
        original = row[0]
    finally:
        conn.close()

    # 307 rather than 301: browsers don't cache it, so every real visit
    # reaches us and counts towards hits
    return RedirectResponse(url=original, status_code=307)