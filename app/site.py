#!/usr/bin/env python3
"""Build every subject and a static index page linking them (for GitHub Pages).

Usage:  python3 app/site.py [output-dir]      (default: _site)

Every top-level folder with a subject.json is treated as a subject and built
with app/build.py into <output-dir>/<subject>/index.html. The index page at
<output-dir>/index.html links to each app (to run it online) and offers a
download of the single-file app (to use offline).
"""
import html, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = 'https://github.com/marc-hanheide/gcse-support'

PAGE = '''<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GCSE revision apps</title>
<style>
:root{--bg:#f5f6fb;--card:#fff;--tx:#1b1e28;--mut:#5a6073;--bd:#e1e4ee;--ac:#4338ca}
@media (prefers-color-scheme:dark){:root{--bg:#0e1017;--card:#171a23;--tx:#eceef6;--mut:#a5abbd;--bd:#2a2f3e;--ac:#9aa0ff}}
body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
main{max-width:720px;margin:0 auto;padding:24px 16px}
h1{margin:0 0 4px}
a{color:var(--ac)}
.mut{color:var(--mut)}
.card{background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:16px;margin:14px 0}
.card h2{margin:0 0 4px;font-size:1.2rem}
.card p{margin:0 0 12px}
.btns{display:flex;flex-wrap:wrap;gap:10px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 16px;border-radius:12px;border:1px solid var(--bd);background:var(--card);color:var(--tx);font-weight:600;text-decoration:none}
.btn.pri{background:var(--ac);border-color:var(--ac);color:#fff}
@media (prefers-color-scheme:dark){.btn.pri{color:#0e1017}}
footer{font-size:.9rem;margin-top:28px}
</style>
</head>
<body>
<main>
<h1>GCSE revision apps</h1>
<p class="mut">Mobile-first revision apps. Open one online, or download the single HTML file to use it offline on any device.</p>
%s
<footer class="mut">
<p><strong>Disclaimer:</strong> these apps are provided for revision only. The information in them is not guaranteed to be correct or complete; check anything important against the exam board specification and with your teacher.</p>
<p>&copy; Marc Hanheide. Source code and licence (Apache 2.0): <a href="%s">github.com/marc-hanheide/gcse-support</a></p>
</footer>
</main>
</body>
</html>
'''


def subjects():
    return sorted(d for d in os.listdir(ROOT)
                  if not d.startswith('.') and os.path.isfile(os.path.join(ROOT, d, 'subject.json')))


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '_site'))
    os.makedirs(out, exist_ok=True)
    cards = []
    for s in subjects():
        with open(os.path.join(ROOT, s, 'subject.json'), encoding='utf8') as f:
            meta = json.load(f)
        subprocess.run([sys.executable, os.path.join(ROOT, 'app', 'build.py'), s,
                        os.path.join(out, s, 'index.html')], check=True)
        e = html.escape
        cards.append(
            '<div class="card"><h2>%s</h2><p class="mut">%s</p><div class="btns">'
            '<a class="btn pri" href="%s/">Open online</a>'
            '<a class="btn" href="%s/index.html" download="%s">Download</a></div></div>'
            % (e(meta.get('pageTitle', meta['title'])), e(meta.get('subtitle', '')),
               e(s), e(s), e(s + '-revision.html')))
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf8') as f:
        f.write(PAGE % ('\n'.join(cards), REPO))
    with open(os.path.join(out, '.nojekyll'), 'w') as f:
        f.write('')
    print('wrote', os.path.join(out, 'index.html'), 'with', len(cards), 'apps')


if __name__ == '__main__':
    main()
