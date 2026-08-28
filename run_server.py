import http.server
import socketserver
import webbrowser
import os
import urllib.request
import urllib.parse
import json
import time
import socket

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def load_env_file():
    env_path = os.path.join(DIRECTORY, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception:
            pass

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/tmdb":
            self.handle_tmdb_proxy(parsed)
        elif parsed.path == "/api/steam":
            self.handle_steam_proxy(parsed)
        else:
            super().do_GET()

    def handle_tmdb_proxy(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        endpoint = qs.get("endpoint", [""])[0]

        if not endpoint:
            self.send_json({"error": "Missing 'endpoint' parameter"}, 400)
            return

        token = os.environ.get("TMDB_READ_ACCESS_TOKEN")
        
        if not token:
            self.send_json({"error": "TMDB token not configured"}, 503)
            return

        sanitized = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        if ".." in sanitized:
            self.send_json({"error": "Invalid endpoint"}, 400)
            return

        params = {}
        for k, v in qs.items():
            if k != "endpoint":
                params[k] = v[0]
        if "language" not in params:
            params["language"] = "en-US"

        encoded_params = urllib.parse.urlencode(params)
        tmdb_url = f"https://api.themoviedb.org/3{sanitized}"
        if encoded_params:
            tmdb_url += f"?{encoded_params}"

        page = params.get("page", "1")
        print(f"[DEBUG] 📄 TMDB Page {page}")

        max_retries = 3
        for attempt in range(max_retries):
            try:
                req = urllib.request.Request(tmdb_url, headers={
                    "Accept": "application/json",
                    "Authorization": f"Bearer {token}",
                    "User-Agent": "CinePlay/1.0"
                })
                
                with urllib.request.urlopen(req, timeout=20) as response:
                    status_code = response.getcode()
                    body = response.read()
                    print(f"[DEBUG] ✅ TMDB Page {page}: {status_code}")
                    
                    self.send_response(status_code)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.send_header("Cache-Control", "public, max-age=3600")
                    self.end_headers()
                    self.wfile.write(body)
                    return
                    
            except (urllib.error.URLError, socket.timeout, ConnectionResetError) as e:
                print(f"[WARN] ⚠️ TMDB attempt {attempt + 1} failed: {type(e).__name__}")
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    print(f"[DEBUG] ⏳ Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                else:
                    print(f"[ERROR] ❌ TMDB all attempts failed")
                    self.send_json({"results": [], "page": int(page), "total_pages": 1, "total_results": 0}, 200)
                    return
            except Exception as e:
                print(f"[ERROR] ❌ TMDB error: {e}")
                self.send_json({"results": [], "page": int(page), "total_pages": 1, "total_results": 0}, 200)
                return

    def handle_steam_proxy(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        action = qs.get("action", [""])[0]
        
        if not action:
            self.send_json({"error": "Missing 'action' parameter"}, 400)
            return

        try:
            if action == "search":
                query = qs.get("query", [""])[0]
                if not query:
                    self.send_json({"error": "Missing 'query' parameter"}, 400)
                    return
                
                steam_url = f"https://store.steampowered.com/api/storesearch/?term={urllib.parse.quote(query)}&l=english&cc=IN"
                print(f"[DEBUG] 🔄 Steam Search: {query}")
                
                req = urllib.request.Request(steam_url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "application/json"
                })
                
                with urllib.request.urlopen(req, timeout=15) as response:
                    body = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.send_header("Cache-Control", "public, max-age=3600")
                    self.end_headers()
                    self.wfile.write(body)
                    print(f"[DEBUG] ✅ Steam Search returned data")
                    
            elif action == "details":
                app_id = qs.get("appid", [""])[0]
                if not app_id:
                    self.send_json({"error": "Missing 'appid' parameter"}, 400)
                    return
                    
                steam_url = f"https://store.steampowered.com/api/appdetails?appids={app_id}&l=english"
                print(f"[DEBUG] 🔄 Steam Details: {app_id}")
                
                req = urllib.request.Request(steam_url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "application/json"
                })
                
                with urllib.request.urlopen(req, timeout=15) as response:
                    body = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.send_header("Cache-Control", "public, max-age=3600")
                    self.end_headers()
                    self.wfile.write(body)
                    print(f"[DEBUG] ✅ Steam Details returned data")
                    
            elif action == "reviews":
                app_id = qs.get("appid", [""])[0]
                if not app_id:
                    self.send_json({"error": "Missing 'appid' parameter"}, 400)
                    return
                    
                steam_url = f"https://store.steampowered.com/appreviews/{app_id}?json=1&language=all"
                print(f"[DEBUG] 🔄 Steam Reviews: {app_id}")
                
                req = urllib.request.Request(steam_url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "application/json"
                })
                
                with urllib.request.urlopen(req, timeout=15) as response:
                    body = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.send_header("Cache-Control", "public, max-age=3600")
                    self.end_headers()
                    self.wfile.write(body)
                    print(f"[DEBUG] ✅ Steam Reviews returned data")
            else:
                self.send_json({"error": f"Unknown action: {action}"}, 400)
                
        except urllib.error.HTTPError as e:
            print(f"[ERROR] ❌ Steam HTTPError: {e.code}")
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"error": "Steam API error", "items": []}')
        except Exception as e:
            print(f"[ERROR] ❌ Steam error: {e}")
            # Return empty results instead of error to prevent UI breakage
            self.send_json({"items": [], "error": str(e)}, 200)

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

def start_server():
    load_env_file()
    
    token = os.environ.get("TMDB_READ_ACCESS_TOKEN")
    print("="*60)
    print("CinePlay Development Server")
    print("="*60)
    if token:
        print(f"[INFO] ✅ TMDB Token loaded")
    else:
        print("[ERROR] ❌ TMDB Token NOT loaded!")
    print("="*60)
    
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving files from: {DIRECTORY}")
        print(f"Local URL: http://localhost:{PORT}/")
        print("="*60)
        print("Press Ctrl+C to stop the server.")
        
        try:
            webbrowser.open(f"http://localhost:{PORT}/")
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    start_server()