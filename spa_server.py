import http.server
import socketserver
import os
import socket
import threading

PORTS = [3456, 8000]
DIRECTORY = "dist"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def address_string(self):
        # Skip reverse DNS lookup to avoid 30-90 second delays
        return self.client_address[0]

    def log_message(self, format, *args):
        # Suppress verbose logging to avoid I/O overhead
        pass

    def end_headers(self):
        self.send_header('Connection', 'close')
        path_lower = self.path.lower()
        if path_lower.endswith('.html') or path_lower == '/' or 'sw.js' in path_lower or 'manifest' in path_lower:
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        self.handle_spa()
        super().do_GET()

    def do_HEAD(self):
        self.handle_spa()
        super().do_HEAD()

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

class ThreadedTCPServer6(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True
    address_family = socket.AF_INET6

def serve_port(port):
    errors = []
    # IPv4
    try:
        server4 = ThreadedTCPServer(("0.0.0.0", port), SPAHandler)
        t4 = threading.Thread(target=server4.serve_forever, daemon=True)
        t4.start()
    except Exception as e:
        errors.append(f"IPv4 port {port}: {e}")

    # IPv6
    try:
        server6 = ThreadedTCPServer6(("::1", port), SPAHandler)
        t6 = threading.Thread(target=server6.serve_forever, daemon=True)
        t6.start()
    except Exception as e:
        errors.append(f"IPv6 port {port}: {e}")

    for err in errors:
        print(f"[WARN] {err}")

if __name__ == "__main__":
    for p in PORTS:
        serve_port(p)

    print(f"Multi-Threaded Dual-Stack (IPv4+IPv6) SPA server active on ports {PORTS}")
    # Keep main thread alive
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        print("Server stopped.")
