"""Verify compression serves exactly the original artifact, not a reduced test page."""
import functools
import gzip
import http.client
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from preview_site import PreviewHandler, accepts_gzip


class PreviewTests(unittest.TestCase):
    def test_negotiation(self):
        for value in ("gzip", "br, gzip;q=0.5", "*;q=1"):
            self.assertTrue(accepts_gzip(value))
        for value in ("", "br", "gzip;q=0, *;q=1", "gzip;q=invalid", "gzip;q=2"):
            self.assertFalse(accepts_gzip(value))

    def test_serving(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "guide").mkdir()
            raw = b"<html><body>" + b"Complete document. " * 200 + b"</body></html>"
            (root / "guide/index.html").write_bytes(raw)
            (root / "app.js").write_bytes(b"const value = 'example';\n" * 200)
            (root / "small.txt").write_bytes(b"tiny")
            server = ThreadingHTTPServer(("127.0.0.1", 0),
                functools.partial(PreviewHandler, directory=tmp))
            worker = threading.Thread(target=server.serve_forever, daemon=True)
            worker.start()
            def request(method, path, encoding):
                conn = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=5)
                try:
                    conn.request(method, path, headers={"Accept-Encoding": encoding})
                    res = conn.getresponse()
                    return res.status, dict(res.getheaders()), res.read()
                finally:
                    conn.close()
            try:
                status, headers, body = request("GET", "/guide/", "gzip")
                self.assertEqual(status, 200)
                self.assertEqual(headers["Content-Encoding"], "gzip")
                self.assertEqual(headers["Vary"], "Accept-Encoding")
                self.assertEqual(gzip.decompress(body), raw)
                self.assertEqual(int(headers["Content-Length"]), len(body))
                status, headers, body = request("GET", "/guide/", "gzip;q=0")
                self.assertEqual(status, 200)
                self.assertNotIn("Content-Encoding", headers)
                self.assertEqual(body, raw)
                status, headers, body = request("HEAD", "/app.js", "gzip")
                self.assertEqual(status, 200)
                self.assertEqual(headers["Content-Encoding"], "gzip")
                self.assertEqual(body, b"")
                self.assertEqual(request("GET", "/guide", "gzip")[0], 301)
                self.assertEqual(request("GET", "/missing", "gzip")[0], 404)
                self.assertNotIn("Content-Encoding", request("GET", "/small.txt", "gzip")[1])
            finally:
                server.shutdown()
                worker.join()
                server.server_close()


if __name__ == "__main__":
    unittest.main()
