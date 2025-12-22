import http.server
import socketserver
import os

PORT = 3456
DIRECTORY = "dist"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_HEAD(self):
        self.handle_spa()
        super().do_HEAD()

    def do_GET(self):
        self.handle_spa()
        super().do_GET()

    def handle_spa(self):
        # Allow immediate serving of existing files
        # Check if the path points to an actual file
        params = self.path.split('?', 1)
        path = params[0]
        
        # Construct local path
        local_path = os.path.join(DIRECTORY, path.lstrip('/'))
        
        # If it's a file that exists, serve it
        if os.path.isfile(local_path):
            return
            
        # If it's a directory, let standard handler try (it handles index.html in dirs)
        if os.path.isdir(local_path):
             return

        # Fallback to index.html for SPA routing
        self.path = '/index.html'

# Enable address reuse to prevent "Address already in use" errors on restart
socketserver.TCPServer.allow_reuse_address = True

print(f"Starting SPA server on port {PORT}")
with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
