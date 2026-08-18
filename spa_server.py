import http.server
import socketserver
import os

PORT = 3456
DIRECTORY = "dist"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Force no caching for html, sw.js, and manifest
        path_lower = self.path.lower()
        if path_lower.endswith('.html') or path_lower == '/' or 'sw.js' in path_lower or 'manifest' in path_lower:
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def do_HEAD(self):
        self.handle_spa()
        super().do_HEAD()

    def do_GET(self):
        self.handle_spa()
        super().do_GET()

    def handle_spa(self):
        params = self.path.split('?', 1)
        path = params[0]
        local_path = os.path.join(DIRECTORY, path.lstrip('/'))
        if os.path.isfile(local_path):
            return
        if os.path.isdir(local_path):
            return
        self.path = '/index.html'

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

print(f"Starting Multi-Threaded SPA server on port {PORT}")
with ThreadedTCPServer(("", PORT), SPAHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
