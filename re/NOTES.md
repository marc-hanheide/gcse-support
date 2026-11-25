# RE (AQA GCSE Religious Studies A, 8062): notes

Course route: Paper 1 Christianity and Judaism (beliefs and practices), Paper 2 Themes A, B, D and E. Built in November 2026 for a Year 10 student at The Priory Academy LSST, Lincoln.

## Exam format used

From summer 2026 AQA changed each five-part question to **1, 1, 4, 6 and 12 marks** (previously 1, 2, 4, 5, 12). Up to 3 SPaG marks come from the 12-mark answers. Source: AQA, "GCSE Religious Studies: updates to our assessments for 2026" and the 8062 scheme of assessment. Each paper is 1 hour 45 minutes and 50% of the GCSE. The school's guidance, followed in the app: Paper 1 Beliefs 4-markers are "influence" questions, Paper 1 Practices 4-markers are "different" questions, Paper 2 4-markers are "different" or "similar" and must include a Christian view.

## Content counts

Expanded in November 2026 (issue #4) to cover every AQA specification point for this route.

| Section | Topics | Cards | Quiz | True or false | Short (1 mark) | Exam (4 / 6 / 12 marks) | Spec points |
|---|---|---|---|---|---|---|---|
| Christianity: Beliefs | 12 | 120 | 72 | 59 | 40 | 12 / 12 / 12 | 23 |
| Christianity: Practices | 13 | 119 | 72 | 54 | 39 | 13 / 13 / 13 | 21 |
| Judaism: Beliefs | 10 | 104 | 61 | 50 | 32 | 10 / 11 / 11 | 18 |
| Judaism: Practices | 14 | 132 | 74 | 64 | 42 | 14 / 14 / 14 | 17 |
| Theme A | 7 | 112 | 60 | 33 | 26 | 13 / 12 / 7 | 24 |
| Theme B | 10 | 128 | 68 | 42 | 34 | 13 / 11 / 11 | 21 |
| Theme D | 8 | 114 | 56 | 38 | 30 | 12 / 10 / 10 | 21 |
| Theme E | 8 | 109 | 53 | 35 | 26 | 11 / 8 / 10 | 22 |

Every topic has at least one 4, 6 and 12-mark question, 8 flashcards, 5 multiple-choice questions, 4 true or false statements, 3 Give/Name questions, 3 sources of wisdom and authority, and common mistakes taken from AQA examiner reports (June 2022 to June 2025). "Who believes this?" questions are generated from each topic's views. `re/tools/check_section.py` enforces these minimums.

### How coverage was checked

- Each section's `spec` list paraphrases every bullet and sub-bullet of the current specification (version 1.3, 1 September 2025) and links it to topics. For the themes it also lists the "must explain contrasting beliefs" issues.
- Content was checked against the 2026-format sample papers and mark schemes (8062/13, 8062/16, 8062/2A), AQA's marked answers from the 2026 series, past mark schemes June 2022 to June 2025 and examiner reports.
- Questions and model answers are original. No AQA questions are reproduced; the app links to AQA's past papers instead.
- Bible quotations were compared automatically with the World English Bible (bible-api.com); the few mismatches flagged were NIV wording or deliberate paraphrase. Tenakh, Mishnah, Talmud and Pirkei Avot references were checked on Sefaria.
- An independent reviewer then read every quiz, true or false, short and flashcard item (about 2,300), checked all 57 non-Bible sources, about 300 dated or numeric statements and about 25 recent events on the web, and read 16 model 12-mark answers. Three errors were fixed (civil partnerships began in 2005; the crucifixion began in the morning, Jesus died at about 3pm; one related flashcard). Left as standard GCSE usage: the definition of a sacrament attributed to St Augustine (the wording is the Book of Common Prayer's, based on Augustine).

## Corrections made to the school's material (AQA or accurate sources followed)

- Wrong Bible references on the school sheets: Exodus 14:20 (adultery) is Exodus 20:14; Luke 16:8 (divorce) is Luke 16:18; Deuteronomy 24:10 is 24:1; Genesis 2:25 is 2:24; John 15:12 is 15:13; John 14:22 is 14:2; Isaiah 5:6 is 55:6; Leviticus 9:18 is 19:18; Genesis 9:8-10 for the sanctity of life is better cited as Genesis 9:6. "Just as He said" is Matthew 28:6, not Mark 16:6.
- Judaism: positive mitzvot are 248 (not 284); the Temples were destroyed in 586 BCE and 70 CE; Gehinnom (not Sheol) is the place of purification in AQA's mark scheme; Bat Mitzvah is not "Reform only"; Reform Pesach is 7 days (8 for Orthodox outside Israel).
- Christianity: Orthodox baptism is by immersion; Orthodox view of communion is "real presence as a mystery" rather than transubstantiation; Trussell Trust now has about 1,700 food bank centres, not "over 400"; Maundy money is now given by the King.
- Methodist Church in Britain approved same-sex weddings in 2021, so the school's statement on marriage is out of date.
- Theme D: just war list extended with discrimination (protection of non-combatants), which AQA mark schemes credit; Crusades given as "from 1095". Theme E: no fixed "25 years" life sentence (murder carries a mandatory life sentence with a judge-set minimum term).
- Corrected in the November 2026 expansion: "faith without works is dead" is James 2:26 (not 2:17); "It is not your duty to finish the work" is Pirkei Avot 2:16 (Mishnah, not Talmud); "only Torah and good deeds go with you" is Pirkei Avot 6:9; Kaddish for a parent is said for 11 months; the binding of Isaac is not part of the covenant with Abraham in AQA's mark schemes; one Acts 1:8 citation for Pentecost corrected; view texts that named their own group rewritten; weak quiz distractors replaced; 12-mark stems updated to the 2026 wording.
- Topics added beyond the school list are flagged in each topic's `code` field (for example gender prejudice and discrimination, sanctity and quality of life, the Spirit and salvation, Christmas and Easter in Britain, cohabitation and same-sex marriage).

## Time-sensitive facts (as stated in the app, check before the exam)

- Abortion: the Crime and Policing Act 2026 (Royal Assent 29 April 2026) removed women from the criminal law on ending their own pregnancy in England and Wales; the Abortion Act 1967 framework, including the 24-week limit, is unchanged.
- Assisted dying: the Terminally Ill Adults (End of Life) Bill was defeated at second reading in the Commons on 11 September 2026 (286 to 270); it remains illegal in England and Wales. Scotland's bill was rejected in March 2026.
- Church of England blesses same-sex couples (Prayers of Love and Faith, 2023) but does not hold same-sex weddings; Methodist Church allows them since 2021. Sarah Mullally became Archbishop of Canterbury in 2026.
- UK Reform and Liberal Judaism voted in 2025 to merge as Progressive Judaism (in effect from 2026); AQA still uses "Reform".
- Israel: in March 2026 the Knesset passed a law (62 to 48) making death the default sentence for Palestinians convicted in West Bank military courts of deadly attacks; it was challenged in court.
- Catholic teaching: the death penalty is "inadmissible" (Catechism 2267, revised 2018), restated by Pope Leo XIV in 2026.
- New START expired on 5 February 2026; the UK has not joined the Treaty on the Prohibition of Nuclear Weapons.
- Smacking is still allowed in England under the "reasonable punishment" defence; banned in Scotland and Wales.
- Statistics are dated in the text (2021 census, Trussell 2025 figures, Open Doors 2026, ONS, Home Office hate crime to March 2026, Amnesty 2025, 2.54 million animal procedures in 2025).
- Provisional exam dates (AQA, January 2026): Paper 1 Thursday 13 May 2027, Paper 2 Friday 21 May 2027, both mornings.

## Not fully verified (check before relying on them)

- Some Bible quotations use NIV-style wording from memory; references were checked, wording was compared with the WEB translation only loosely.
- Catechism paragraph numbers (for example 1030, 2270, 2366, 2417 to 2418, 2691) were checked against snippets or memory, not the full Vatican text.
- Denominational positions phrased with "some" or "most": Methodist and Reform Jewish positions on abortion and assisted dying, Methodist positions on nuclear weapons and the death penalty, Anglican acceptance of nuclear deterrence, the Christian Institute on smacking bans, the US Reform movement's position on the death penalty "since 1959".
- Organisations and dates from memory: Ascension Trust and Rev Les Isaac, Alpha (1977, Nicky Gumbel from 1990), Tearfund and the Evangelical Alliance, Barnabas Fund or Barnabas Aid, CAFOD 1962, Christian Aid 1945, Pax Christi, Desmond Doss.
- Jewish details from general knowledge: Reform prayer-book wording changes, UK Reform keeping "often one day" of Rosh Hashanah, meat and dairy waiting times, the Shekhinah and the Western Wall, quotations from Rabbis Steinsaltz and Linzer and Ahad Ha'am. Two interpretations are flagged as such in the text (Shevuot 35b on the limits of war; a Mishnah Sanhedrin 4:5 variant).
- School claims kept but flagged as estimates: "80,000 become Christians daily", "80% of religious persecution targets Christians".
- Prison population (about 87,000 to 88,000, 2025 to 2026) and reoffending after short sentences ("more than half") are approximate.
- BBC Bitesize could not be fetched, so content was not cross-checked against it.

## Sources

- AQA GCSE Religious Studies A (8062) specification and scheme of assessment: https://www.aqa.org.uk/subjects/religious-studies/gcse/religious-studies-a-8062
- AQA assessment updates for summer 2026: https://www.aqa.org.uk/news/update-gcse-religious-studies-summer-2026
- AQA specification version 1.3 (1 September 2025)
- AQA summary of changes June 2026, and answers and commentaries from the 2026 series
- AQA sample assessment materials from 2026 and mark schemes June 2022 to June 2025 (8062/13 Christianity, 8062/16 Judaism, 8062/2A Themes), examiner reports June 2022 to June 2025
- AQA provisional timetable for summer 2027 (January 2026)
- World English Bible (bible-api.com) and Sefaria for scripture checks
- AQA teaching guide to the 5-mark (now 6-mark) questions
- The school's Year 10 RE revision pack (not included in this repository)
