#!/usr/bin/env python3
import sys
import re
from pathlib import Path
from html.parser import HTMLParser

class YouTubeTitleParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = []               # (video_id, title)
        self._seen = set()
        self._current_vid = None
        self._current_text = []
        self._in_target_a = False
        self._vid_re = re.compile(r'[?&]v=([A-Za-z0-9_-]{11})')

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return

        attrs_dict = {k.lower(): v for k, v in attrs}
        href = attrs_dict.get("href")
        a_id = attrs_dict.get("id")

        # Only pick the real title link
        if a_id != "video-title" or not href:
            return

        m = self._vid_re.search(href)
        if not m:
            return

        self._current_vid = m.group(1)
        self._current_text = []
        self._in_target_a = True

    def handle_data(self, data):
        if self._in_target_a and self._current_vid is not None:
            self._current_text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() != "a":
            return
        if not self._in_target_a or self._current_vid is None:
            return

        raw = "".join(self._current_text)
        title = " ".join(raw.split()).strip()

        if title and self._current_vid not in self._seen:
            self._seen.add(self._current_vid)
            self.items.append((self._current_vid, title))

        self._in_target_a = False
        self._current_vid = None
        self._current_text = []


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} input.html", file=sys.stderr)
        sys.exit(1)

    html = Path(sys.argv[1]).read_text(encoding="utf-8", errors="ignore")

    parser = YouTubeTitleParser()
    parser.feed(html)

    leading_num_re = re.compile(r'^\s*(\d+)\s*-')

    # Output: "Title..." => '4v' : 'VIDEOID',
    used_keys = set()
    for i, (vid, title) in enumerate(parser.items, start=1):
        m = leading_num_re.match(title)
        if m:
            key_num = m.group(1)
        else:
            # fallback if no leading number
            key_num = str(i)

        # in unlikely case of duplicate key, fallback to index
        key = f"{key_num}v"
        if key in used_keys:
            key = f"{i}v"
        used_keys.add(key)

        safe_title = title.replace('"', '\\"')
        print(f"\"{safe_title}\" => '{key}' : '{vid}',")


if __name__ == "__main__":
    main()
