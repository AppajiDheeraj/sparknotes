import sys
import json
from yt_dlp import YoutubeDL

url = sys.argv[1]

try:
    ydl_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitlesformat': 'json3',
        'subtitleslangs': ['en'],
        'outtmpl': 'output',
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    with open("output.en.json3", "r", encoding="utf-8") as f:
        data = json.load(f)
        transcript = " ".join([entry['segs'][0]['utf8'] for entry in data['events'] if 'segs' in entry])
        print(transcript)
except Exception as e:
    print("ERROR:", e)
    sys.exit(1)
