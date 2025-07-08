import sys
import subprocess
import json
import os

yt_dlp_path = os.path.join(os.path.dirname(__file__), 'yt-dlp.exe')
url = sys.argv[1]

try:
    subprocess.run([
        yt_dlp_path,
        "--write-auto-sub",
        "--skip-download",
        "--sub-lang", "en",
        "--sub-format", "json3",
        "-o", "output",
        url
    ], check=True)

    with open("output.en.json3", "r", encoding="utf-8") as f:
        data = json.load(f)
        transcript = " ".join([entry['segs'][0]['utf8'] for entry in data['events'] if 'segs' in entry])
        print(transcript)
except Exception as e:
    print("ERROR:", e)
    sys.exit(1)
