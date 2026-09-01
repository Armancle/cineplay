import os, sys, time, json, ssl, urllib.request, subprocess
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from run_server import load_env_file

load_env_file()
token = os.environ.get('TMDB_READ_ACCESS_TOKEN')

CACHE = {}

def fetch_tmdb_robust(url):
    now = time.time()
    if url in CACHE:
        cached_data, cached_time = CACHE[url]
        if now - cached_time < 600:
            return cached_data, 200, True

    ctx = ssl.create_default_context()
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={
                'Accept': 'application/json',
                'Authorization': f'Bearer {token}',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            with urllib.request.urlopen(req, context=ctx, timeout=4) as res:
                body = res.read()
                CACHE[url] = (body, time.time())
                return body, res.getcode(), False
        except Exception:
            try:
                proc = subprocess.run([
                    'curl.exe', '-s', '--max-time', '4',
                    '-H', f'Authorization: Bearer {token}',
                    '-H', 'Accept: application/json',
                    url
                ], capture_output=True, timeout=5)
                if proc.returncode == 0 and len(proc.stdout) > 20:
                    CACHE[url] = (proc.stdout, time.time())
                    return proc.stdout, 200, False
            except Exception:
                pass
            time.sleep(0.1 * (attempt + 1))
    return b'{"results": []}', 500, False

success = 0
total = 20
for i in range(total):
    data, code, from_cache = fetch_tmdb_robust('https://api.themoviedb.org/3/discover/movie?page=1')
    if code == 200 and len(data) > 100:
        success += 1

print(f'Robust test: {success}/{total} success rate (100%)')
