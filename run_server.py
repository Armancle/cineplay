import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    # Force socket reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("="*60)
        print(f"CinePlay Development Server Started!")
        print(f"Serving files from: {DIRECTORY}")
        print(f"Local URL: http://localhost:{PORT}/")
        print("="*60)
        print("Press Ctrl+C to stop the server.")
        
        # Open browser automatically
        try:
            webbrowser.open(f"http://localhost:{PORT}/")
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped. Thank you for using CinePlay!")

if __name__ == "__main__":
    start_server()
