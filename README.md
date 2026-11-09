# gcse-support

A mobile-first revision app for GCSE subjects. The whole app compiles to **one self-contained HTML file** (CSS, JavaScript and all content inlined, no network needed), so it can be opened from a phone, hosted anywhere, or added to the home screen.

Features: topic notes, flashcards with spaced repetition, multiple-choice quizzes with explanations, timed exam-question practice with model answers and self-marking, glossary, quote bank, search, dark mode. Progress is saved in the browser (`localStorage`) on the device.

## Layout

```
app/                  generic engine, shared by every subject
  shell.html          page skeleton
  app.css             styles
  app.js              the app (routing, cards, quiz, write, glossary, search)
  build.py            compiles one subject into a single HTML file
re/                   GCSE Religious Studies (AQA 8062), first subject
  subject.json        title, colours, section order, about text, question structures
  data/*.json         one file per section (topics, flashcards, quiz, exam)
  glossary.json       AQA key terms
  guide.js            exam guide and quote map (HTML strings)
  tools/glossary.py   script used to turn AQA's vocabulary documents into glossary.json
  dist/index.html     the compiled single-file app (committed for convenience)
  NOTES.md            sources, corrections to school material, items to verify
fr/                   GCSE French (AQA 8652), Year 10 units 1 and 2 plus grammar
  subject.json        also sets labels, speech (fr-FR) and vocabulary flashcards
  data/*.json         unit-1, unit-2, grammar
  guide.js            AQA exam guide
  dist/index.html     the compiled single-file app
```

## Build

Python 3 only, no dependencies.

```
python3 app/build.py re                 # writes re/dist/index.html
python3 app/build.py re /tmp/re.html    # or to a path of your choice
python3 app/build.py fr                 # writes fr/dist/index.html
```

The build validates the data (unknown topic ids, quiz options, missing model answers, em or en dashes) and exits non-zero if anything is wrong. Open the output file directly in a browser to test; it works from `file://`.

## Adding another subject

1. Create a folder, for example `maths/`, with `subject.json`, a `data/` folder and optionally `glossary.json` and `guide.js` (copy `re/` as a starting point).
2. In `subject.json` list the section ids in `sectionOrder`, give each a colour in `colors`, and choose a unique `storageKey` so progress for different subjects stays separate.
3. Add one `data/<section-id>.json` per section using the schema below.
4. `python3 app/build.py maths`

Question-type guidance shown on the Write screen comes from `structures` in `subject.json` (keyed by each exam item's `type`). The self-mark checklist for `evaluate` questions can be replaced with `evaluateChecklist`.

Optional `subject.json` settings (see `fr/subject.json`):

- `labels`: rename headings, for example `views`, `sources`, `terms`, `quoteBank`, `paper`.
- `papers` and `scopeLabels`: headings for section groups and the matching entries in the "What to cover" menu.
- `typeNames`: a title for each exam item `type`, shown instead of "N mark question".
- `termCards`: turn every topic `terms` entry into a flashcard (definition on the front, term on the back).
- `glossaryFromTerms`: build the glossary from the topics' `terms` when there is no `glossary.json`.
- `speak`: a language code such as `fr-FR`. Adds listen buttons using the device's speech synthesis to terms, phrases, flashcards (`say` field) and model answers (`say: true` on a view or exam item). Exam items with `listen: true` get a Listen button on the question, for dictation and reading aloud.

## Section schema

```json
{
  "section": {"id": "...", "title": "...", "short": "...", "paper": 1, "religion": "...", "blurb": "..."},
  "topics": [{
    "id": "xx-01", "code": "spec reference", "title": "...", "overview": "...",
    "notes": [{"h": "sub-heading", "bullets": ["..."]}],
    "views": [{"label": "...", "text": "..."}],
    "terms": [{"term": "...", "def": "..."}],
    "sources": [{"text": "...", "ref": "...", "use": "..."}],
    "tip": "..."
  }],
  "flashcards": [{"topic": "xx-01", "q": "...", "a": "..."}],
  "quiz": [{"topic": "xx-01", "q": "...", "options": ["A", "B", "C", "D"], "answer": 0, "why": "..."}],
  "exam": [{"topic": "xx-01", "marks": 4, "type": "influence", "q": "...", "model": "...", "points": ["..."],
            "for": ["..."], "against": ["..."], "conclusion": "..."}]
}
```

`for`, `against` and `conclusion` are used by `evaluate` items (12-mark questions), which may omit `points`.

## Notes

- Writing style: British English, no em or en dashes (the build rejects them).
- The school's own revision pack that the RE content was built from is not included in this repository. Questions and model answers are written for revision and are not real past-paper questions.
- `re/glossary.json` uses AQA's published subject vocabulary definitions.
- Content was drafted with AI help and checked against the AQA specification, but some details are flagged as unverified in `re/NOTES.md`. Check anything doubtful with the teacher.
