import sys
import json
import subprocess

def search_yt(query, count=30):
    cmd = ["python3", "-m", "yt_dlp", f"ytsearch{count}:{query}", "--dump-json", "--flat-playlist", "--no-warnings"]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        tracks = []
        seen_ids = set()
        if proc.returncode == 0 and proc.stdout:
            for line in proc.stdout.strip().split('\n'):
                if not line or not line.startswith('{'):
                    continue
                try:
                    data = json.loads(line)
                    vid_id = data.get('id')
                    if not vid_id or vid_id in seen_ids:
                        continue
                    seen_ids.add(vid_id)

                    title = data.get('title', 'Unknown Track')
                    uploader = data.get('uploader') or data.get('channel') or 'Official Artist'
                    duration_sec = data.get('duration') or 210
                    mins = int(duration_sec) // 60
                    secs = int(duration_sec) % 60
                    dur_str = f"{mins}:{secs:02d}"
                    size_mb = f"{round(duration_sec * 0.035, 1)} MB"
                    
                    tracks.append({
                        'id': vid_id,
                        'title': title,
                        'artist': uploader,
                        'duration': dur_str,
                        'bitrate': '320kbps',
                        'size': size_mb,
                        'source': 'YouTube Official'
                    })
                except Exception:
                    pass
        return tracks
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "Dadju"
    results = search_yt(query, 30)
    print(json.dumps(results))
