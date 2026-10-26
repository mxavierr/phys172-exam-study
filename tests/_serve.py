"""Serve the built site over http://127.0.0.1 for the tests.

Cookies and the page's Content-Security-Policy only behave as on the real host over http(s),
not from file://. page_url(arg) accepts a built page (dist/index.html) or an http(s) URL; for a
file it serves that file's folder on a free port in a background thread and returns
(url, origin): it serves the whole site (the folder holding katex/), so shared files resolve.
Tests allow requests to `origin` and block everything else."""
import functools, http.server, pathlib, threading

class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

class _Server(http.server.ThreadingHTTPServer):
    def handle_error(self, request, client_address): pass     # a page navigating away mid-response is normal

def page_url(arg):
    if arg.startswith(('http://', 'https://')):
        origin = '/'.join(arg.split('/')[:3])
        return arg, origin
    page = pathlib.Path(arg).resolve()
    root = next((d for d in page.parents if (d / 'katex').is_dir()), page.parent)   # the site root (shared files)
    handler = functools.partial(_Quiet, directory=str(root))
    srv = _Server(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{srv.server_address[1]}'
    return f'{origin}/{page.relative_to(root).as_posix()}', origin
