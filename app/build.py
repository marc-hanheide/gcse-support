#!/usr/bin/env python3
"""Compile one subject into a single self-contained HTML file.

Usage:  python3 app/build.py <subject> [output.html]
Example: python3 app/build.py re        ->  re/dist/index.html

A subject folder contains:
  subject.json   title, colours, section order, about text (see re/subject.json)
  data/*.json    one file per section (schema in README.md)
  glossary.json  optional list of {group, term, def}; or set glossaryFromTerms
                 in subject.json to build it from the topics' terms
  guide.js       optional; defines TECH_GUIDE and TECH_QUOTES (HTML strings)
The output has all CSS, JavaScript and data inlined: no network needed.
"""
import datetime, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, 'app')


def walk(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, path + '/' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, path + '/' + str(i))
    elif isinstance(o, str):
        yield path, o


def read(p):
    with open(p, encoding='utf8') as f:
        return f.read()


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    subj = sys.argv[1]
    sd = os.path.join(ROOT, subj)
    meta = json.loads(read(os.path.join(sd, 'subject.json')))
    problems, secs = [], []
    for sid in meta['sectionOrder']:
        p = os.path.join(sd, 'data', sid + '.json')
        if not os.path.exists(p):
            problems.append('MISSING ' + sid)
            continue
        d = json.loads(read(p))
        tids = {t['id'] for t in d['topics']}
        for key in ('flashcards', 'quiz', 'exam'):
            for i, x in enumerate(d.get(key, [])):
                if x.get('topic') not in tids:
                    problems.append(f'{sid} {key}[{i}] unknown topic {x.get("topic")}')
        for i, x in enumerate(d.get('quiz', [])):
            if len(x['options']) != 4 or not isinstance(x['answer'], int) or not 0 <= x['answer'] <= 3:
                problems.append(f'{sid} quiz[{i}] bad options/answer')
            if len(set(x['options'])) != 4:
                problems.append(f'{sid} quiz[{i}] duplicate options')
        for i, x in enumerate(d.get('exam', [])):
            for k in ('points', 'for', 'against'):
                if k in x and not isinstance(x[k], list):
                    problems.append(f'{sid} exam[{i}] {k} should be a list')
            if not x.get('model') or (x.get('type') != 'evaluate' and not x.get('points')):
                problems.append(f'{sid} exam[{i}] missing model/points')
            if x.get('type') == 'evaluate' and not (x.get('for') and x.get('against') and x.get('conclusion')):
                problems.append(f'{sid} exam[{i}] evaluate item missing for/against/conclusion')
        for path, s in walk(d):
            if '\u2014' in s or '\u2013' in s:
                problems.append(f'{sid}{path} has an em or en dash')
        secs.append(d)
    gp = os.path.join(sd, 'glossary.json')
    gl = json.loads(read(gp)) if os.path.exists(gp) else []
    if not gl and meta.get('glossaryFromTerms'):
        # build the glossary from every topic's terms (used for vocabulary lists)
        seen = set()
        for d in secs:
            for t in d['topics']:
                for x in t.get('terms', []):
                    group = d['section'].get('short', d['section']['title'])
                    k = (group, x['term'], x['def'])
                    if k not in seen:
                        seen.add(k)
                        gl.append({'group': group, 'term': x['term'], 'def': x['def']})
    clean = {k: v for k, v in meta.items() if k not in ('sectionOrder', 'pageTitle')}
    data = {'meta': clean, 'sections': secs, 'glossary': gl,
            'built': datetime.date.today().strftime('%d %b %Y')}
    js = 'const DATA=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';'
    js = js.replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    gj = os.path.join(sd, 'guide.js')
    out = (read(os.path.join(APP, 'shell.html'))
           .replace('/*__TITLE__*/', meta.get('pageTitle', meta['title']))
           .replace('/*__SHORT__*/', meta.get('short', meta['title']))
           .replace('/*__CSS__*/', read(os.path.join(APP, 'app.css')))
           .replace('/*__DATA__*/', js)
           .replace('/*__GUIDE__*/', read(gj) if os.path.exists(gj) else '')
           .replace('/*__APP__*/', read(os.path.join(APP, 'app.js'))))
    dest = sys.argv[2] if len(sys.argv) > 2 else os.path.join(sd, 'dist', 'index.html')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf8') as f:
        f.write(out)
    print('wrote', dest, round(len(out) / 1024), 'KB')
    for d in secs:
        nv = sum(len(t.get('terms', [])) for t in d['topics']) if meta.get('termCards') else 0
        print(' ', d['section']['id'], 'topics', len(d['topics']), 'cards', len(d['flashcards']) + nv,
              'quiz', len(d['quiz']), 'exam', len(d['exam']))
    print('PROBLEMS', len(problems))
    for p in problems[:60]:
        print('  ', p)
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
