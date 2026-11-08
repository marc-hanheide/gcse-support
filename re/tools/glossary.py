import json, re
def norm(s):
    return (s.replace('ﬁ','fi').replace('ﬂ','fl').replace('’',"'").replace('‘',"'")
             .replace('–','-').replace('—',',').strip())
def parse(path, groupmap):
    out=[]; group=None; term=None
    for raw in open(path, encoding='utf8').read().split('\n'):
        if not raw.strip() or raw.strip()=='[]': continue
        line=norm(raw)
        key=line.lower().rstrip(':')
        hit=None
        for pat,g in groupmap.items():
            if line.lower().startswith(pat): hit=g
        if hit and not raw.startswith('    '):
            group=hit; term=None; continue
        if raw.startswith('  ') and term is not None:
            if out and out[-1]['term']==term and out[-1]['group']==group:
                out[-1]['def']=(out[-1]['def']+' '+line).strip()
            else:
                out.append({'group':group,'term':term,'def':line})
        elif not raw.startswith('  '):
            if group is not None: term=line
    return [o for o in out if o['group']]
a=parse('txt/03_AQA_Key_Terms_Religions.docx.txt',{'christianity':'Christianity','judaism':'Judaism'})
b=parse('txt/04_AQA_Key_Terms_Themes.docx.txt',{'theme a':'Theme A','theme b':'Theme B','theme d':'Theme D','theme e':'Theme E'})
allg=a+b
json.dump(allg,open('data/glossary.json','w'),ensure_ascii=False,indent=0)
from collections import Counter
print(Counter(o['group'] for o in allg), len(allg))
for o in allg[:3]+allg[-3:]: print(o)
