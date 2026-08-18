import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "dist"

import socket
import threading

PORTS = [3456, 8000]

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Connection', 'close')
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

def serve_port(port):
    try:
        with ThreadedTCPServer(("", port), SPAHandler) as httpd:
            print(f"Serving SPA on http://0.0.0.0:{port}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server on port {port}: {e}")

if __name__ == "__main__":
    threads = []
    for p in PORTS:
        t = threading.Thread(target=serve_port, args=(p,), daemon=True)
        t.start()
        threads.append(t)
    
    print(f"Multi-Threaded SPA server running on ports {PORTS}")
    for t in threads:
        t.join()
