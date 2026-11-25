"""Local static QA preview with ordinary HTTP compression negotiation.

Not a production server. Keep the deployable artifact unchanged.
"""
import argparse
import gzip
import io
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


def accepts_gzip(header):
    qualities = {}
    for item in header.lower().split(","):
        name, *params = item.strip().split(";")
        quality = 1.0
        for param in params:
            key, sep, value = param.strip().partition("=")
            if sep and key == "q":
                try:
                    quality = float(value)
                except ValueError:
                    quality = 0.0
        qualities[name.strip()] = quality if 0 <= quality <= 1 else 0.0
    return qualities.get("gzip", qualities.get("*", 0)) > 0


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Vary", "Accept-Encoding")
        super().end_headers()

    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir() and urlsplit(self.path).path.endswith("/"):
            path = path / "index.html"
        mime = self.guess_type(str(path))
        compressible = mime.startswith("text/") or mime in {
            "application/javascript", "application/json", "application/xml",
            "application/xhtml+xml", "image/svg+xml",
        }
        if not (path.is_file() and compressible
                and accepts_gzip(self.headers.get("Accept-Encoding", ""))
                and path.stat().st_size >= 1024):
            return super().send_head()
        raw = path.read_bytes()
        encoded = gzip.compress(raw, compresslevel=6, mtime=0)
        if len(encoded) >= len(raw):
            return super().send_head()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Encoding", "gzip")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Last-Modified", self.date_time_string(path.stat().st_mtime))
        self.end_headers()
        return io.BytesIO(encoded)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", default="dist")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()
    os.chdir(args.directory)
    with ThreadingHTTPServer(("127.0.0.1", args.port), PreviewHandler) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
