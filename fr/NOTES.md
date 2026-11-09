# French (AQA GCSE French, 8652): notes

Built in November 2026 for a Year 10 assessment at The Priory Academy LSST, Lincoln. The topic list comes from the student's exercise book:

- **Unit 1 (Free time):** explain what you do online, say if you have an active lifestyle, discuss what you watch, planning a future day out, describe last weekend, understand questions.
- **Unit 2 (taught in Year 9):** talk about your identity, weekend routine, discuss friends and relationships, describing people and role models, talk about celebrations.

A Grammar toolkit section (present, perfect, future and conditional, imperfect, adjectives and BAGS, opinions and connectives, negatives) supports both units.

## Exam format used

AQA 8652 specification at a glance (first exams 2026): four papers at 25% each, Foundation or Higher. Listening includes a dictation; Speaking is role-play (10), reading aloud plus questions (15), photo card and conversation (25); Reading ends with a translation into English (10); Writing Foundation is photo sentences (10), 50 words with five bullets (10), five grammar questions (5), translation into French (10), 90 words with three bullets (15); Writing Higher is translation (10), 90 words (15), 150 words with two bullets (25). Exam items in the app use these marks and task types, plus short conversation questions (marked 5) for speaking practice.

## How the content is organised

- `terms` in each topic are the vocabulary list. With `termCards` set in `subject.json` the app turns every term into an English to French flashcard, and with `glossaryFromTerms` the build turns them into the glossary.
- `sources` are key phrases (French text, English in `ref`). `views` are model answers with an English translation in `en`.
- `speak: "fr-FR"` adds speaker buttons using the browser's speech synthesis. Exam items with `listen: true` (dictation, reading aloud) show a Listen button before the answer is revealed.

## Not verified

- The class textbook and the school's own word lists were not available, so vocabulary was chosen from the topic titles and the common GCSE core. Check against the school's vocab lists and add any missing words to the topic `terms`.
- The school's options booklet does not name the exam board; AQA was confirmed by the family.
- All French was written without a native-speaker check. Model answers were proofread for grammar, but report anything that looks wrong to the teacher.
- Speech quality depends on the device's French voice.

## Sources

- AQA GCSE French 8652 specification at a glance: https://www.aqa.org.uk/subjects/languages/gcse/french-8652/specification-at-a-glance
