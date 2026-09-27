import sys
import subprocess

def get_audio_url(vid_or_query):
    if vid_or_query.startswith('http'):
        target = vid_or_query
    elif len(vid_or_query) == 11 and not ' ' in vid_or_query:
        target = f"https://www.youtube.com/watch?v={vid_or_query}"
    else:
        target = f"ytsearch1:{vid_or_query}"

    cmd = ["python3", "-m", "yt_dlp", "-f", "bestaudio/best", "-g", "--no-warnings", target]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if proc.returncode == 0 and proc.stdout:
            lines = proc.stdout.strip().split('\n')
            for line in lines:
                if line.startswith('http'):
                    return line.strip()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

    return ""

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "CQLsdm1ZYAw"
    print(get_audio_url(query))
