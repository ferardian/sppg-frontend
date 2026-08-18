import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "dist"

import socket
import threading

PORTS = [3456, 8000]

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
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

class ThreadedIPv6TCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    address_family = socket.AF_INET6
    daemon_threads = True
    allow_reuse_address = True

class ThreadedIPv4TCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    address_family = socket.AF_INET
    daemon_threads = True
    allow_reuse_address = True

def serve_v4(port):
    try:
        with ThreadedIPv4TCPServer(("0.0.0.0", port), SPAHandler) as httpd:
            print(f"Serving IPv4 SPA on http://0.0.0.0:{port}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error IPv4 on port {port}: {e}")

def serve_v6(port):
    try:
        with ThreadedIPv6TCPServer(("::", port), SPAHandler) as httpd:
            print(f"Serving IPv6 SPA on http://[::]:{port}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error IPv6 on port {port}: {e}")

if __name__ == "__main__":
    threads = []
    for p in PORTS:
        t4 = threading.Thread(target=serve_v4, args=(p,), daemon=True)
        t4.start()
        threads.append(t4)
        
        t6 = threading.Thread(target=serve_v6, args=(p,), daemon=True)
        t6.start()
        threads.append(t6)
    
    print(f"Multi-Threaded Dual-Stack (IPv4+IPv6) SPA server active on ports {PORTS}")
    for t in threads:
        t.join()
