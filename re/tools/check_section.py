#!/usr/bin/env python3
"""Validate one RE section file against the expanded schema.

Usage: python3 re/tools/check_section.py <section-id> [--base <git ref>]

--base sets the commit to compare against (default HEAD), for example
--base origin/main to check a whole branch before merging.
Checks the working copy re/data/<id>.json against
the committed original (git HEAD) so existing progress ids stay stable.
"""
import difflib, json, re, subprocess, sys

REPO = __import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__))))
args = sys.argv[1:]
base = 'HEAD'
if '--base' in args:
    i = args.index('--base')
    base = args[i + 1]
    del args[i:i + 2]
sid = args[0]
path = f'{REPO}/re/data/{sid}.json'
d = json.load(open(path, encoding='utf8'))
orig = json.loads(subprocess.run(['git', '-C', REPO, 'show', f'{base}:re/data/{sid}.json'],
                                 capture_output=True, text=True, check=True).stdout)
P, W = [], []

# 1. existing items must keep position (ids are positional). Text may be corrected in
# place, but an item whose text now matches a different original item much better than
# its own looks moved or swapped, which would attach saved progress to another question.
TEXT = {'flashcards': 'q', 'quiz': 'q', 'exam': 'q', 'truefalse': 's', 'short': 'q'}


def sim(x, y):
    return difflib.SequenceMatcher(None, x.lower(), y.lower()).ratio()


for key, field in TEXT.items():
    old, new = orig.get(key, []), d.get(key, [])
    if len(new) < len(old):
        P.append(f'{key}: {len(new)} items, fewer than the original {len(old)} (never delete, only append)')
    old_txt = [o.get(field, '') for o in old]
    for i, o in enumerate(old[:len(new)]):
        n = new[i]
        if n.get('topic') != o.get('topic'):
            P.append(f'{key}[{i}] topic changed {o.get("topic")} -> {n.get("topic")} (do not reorder)')
        if key == 'exam' and n.get('marks') != o.get('marks'):
            P.append(f'exam[{i}] marks changed')
        if key == 'truefalse' and n.get('answer') != o.get('answer'):
            W.append(f'truefalse[{i}] answer flipped: check this is a correction, not a different statement')
        t = n.get(field, '')
        if t == old_txt[i]:
            continue
        own = sim(t, old_txt[i])
        best_j, best = max(((j, sim(t, x)) for j, x in enumerate(old_txt) if j != i), key=lambda z: z[1], default=(None, 0))
        if best > 0.8 and best > own + 0.2:
            P.append(f'{key}[{i}] now matches original {key}[{best_j}] ({best:.0%} vs {own:.0%}): looks moved or swapped')
        elif own < 0.5:
            W.append(f'{key}[{i}] text changed a lot ({own:.0%} similar): make sure it is the same question, corrected')
old_t = [t['id'] for t in orig['topics']]
new_t = [t['id'] for t in d['topics']]
for t in old_t:
    if t not in new_t:
        P.append(f'topic {t} removed (keep all existing topic ids)')
if len(set(new_t)) != len(new_t):
    P.append('duplicate topic ids')
tids = set(new_t)

# 2. schema of every list
def need(cond, msg):
    if not cond:
        P.append(msg)
for key in ('flashcards', 'quiz', 'exam', 'truefalse', 'short'):
    for i, x in enumerate(d.get(key, [])):
        need(x.get('topic') in tids, f'{key}[{i}] unknown topic {x.get("topic")}')
for i, x in enumerate(d.get('quiz', [])):
    need(len(x.get('options', [])) == 4 and isinstance(x.get('answer'), int) and 0 <= x['answer'] <= 3, f'quiz[{i}] needs 4 options and answer 0-3')
    need(len(set(x.get('options', []))) == len(x.get('options', [])), f'quiz[{i}] duplicate options')
    need(bool(x.get('why')), f'quiz[{i}] missing why')
for i, x in enumerate(d.get('truefalse', [])):
    need(isinstance(x.get('answer'), bool) and x.get('s') and x.get('why'), f'truefalse[{i}] needs s, answer (true/false) and why')
for i, x in enumerate(d.get('short', [])):
    need(x.get('q') and x.get('a'), f'short[{i}] needs q and a')
    need(re.match(r'^(Give|Name)\b', x.get('q', '')), f'short[{i}] should start with Give or Name')
for i, x in enumerate(d.get('exam', [])):
    need(x.get('marks') in (4, 6, 12), f'exam[{i}] marks must be 4, 6 or 12')
    need(bool(x.get('model')), f'exam[{i}] missing model')
    if x.get('marks') == 12:
        need(x.get('type') == 'evaluate' and x.get('for') and x.get('against') and x.get('conclusion'), f'exam[{i}] 12-mark needs type evaluate, for, against, conclusion')
        wc = len(x.get('model', '').split())
        if wc < 230:
            W.append(f'exam[{i}] 12-mark model only {wc} words')
    else:
        need(bool(x.get('points')), f'exam[{i}] missing points')
for i, x in enumerate(d.get('spec', [])):
    need(x.get('point') and x.get('topics') and all(t in tids for t in x['topics']), f'spec[{i}] needs point and valid topics')
need(len(d.get('spec', [])) > 0, 'spec checklist missing')

# 3. per-topic minimum counts
def count(key, t, cond=lambda x: True):
    return sum(1 for x in d.get(key, []) if x.get('topic') == t and cond(x))
MIN = {'flashcards': 8, 'quiz': 5, 'truefalse': 4, 'short': 3}
for t in d['topics']:
    tid = t['id']
    for k, m in MIN.items():
        n = count(k, tid)
        if n < m:
            P.append(f'{tid}: {k} {n} < {m}')
    for m in (4, 6, 12):
        if count('exam', tid, lambda x, m=m: x.get('marks') == m) < 1:
            P.append(f'{tid}: no {m}-mark exam question')
    if len(t.get('sources', [])) < 3:
        P.append(f'{tid}: fewer than 3 sources')
    labels = [v['label'] for v in t.get('views', [])]
    if len(set(labels)) != len(labels):
        P.append(f'{tid}: duplicate view labels')
    STOP = {'christian', 'christians', 'jewish', 'church', 'churches', 'some', 'many', 'most', 'other', 'others',
            'views', 'view', 'people', 'liberal', 'traditional', 'religious', 'groups', 'group'}
    for v in t.get('views', []):
        words = [w for w in re.findall(r'[A-Za-z]{5,}', v['label'].lower()) if w not in STOP]
        for w in words:
            if re.search(r'\b' + w[:-1], v['text'].lower()):
                W.append(f'{tid} view "{v["label"]}" text names its own group ("{w}"), rewrite so the who-believes quiz is fair')
                break
    tf = [x['answer'] for x in d.get('truefalse', []) if x['topic'] == tid]
    if tf and (all(tf) or not any(tf)):
        W.append(f'{tid}: true/false statements are all {tf[0]}, mix them')
covered = {t for x in d.get('spec', []) for t in x['topics']}
for t in tids - covered:
    W.append(f'topic {t} not linked from any spec point')

# 4. style
def walk(o, p=''):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, p + '/' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, p + '/' + str(i))
    elif isinstance(o, str):
        yield p, o
for p, s in walk(d):
    if '—' in s or '–' in s:
        P.append(f'{p}: em or en dash')
    if re.search(r'<[a-z/][^>]*>', s):
        P.append(f'{p}: HTML in text')
    m = re.search(r'\b(color|center|favorite|behavior|honor|neighbor|analyze|organize|realize|recognize)\b', s, re.I)
    if m:
        W.append(f'{p}: American spelling? "{m.group(0)}"')

agg = {k: len(d.get(k, [])) for k in ('topics', 'flashcards', 'quiz', 'truefalse', 'short', 'exam', 'spec')}
agg['exam_by_marks'] = {m: sum(1 for x in d['exam'] if x['marks'] == m) for m in (4, 6, 12)}
print(sid, agg)
print('PROBLEMS', len(P))
for p in P[:80]:
    print('  P', p)
print('WARNINGS', len(W))
for w in W[:60]:
    print('  W', w)
sys.exit(1 if P else 0)
