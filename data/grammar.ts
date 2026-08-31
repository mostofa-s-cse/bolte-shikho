export interface GrammarExample {
  en: string
  pron: string
  mean: string
}

export interface GrammarBlock {
  structure?: string
  tag?: string
  examples: GrammarExample[]
}

export interface GrammarStep {
  number: string
  title: string
  intro?: string
  blocks: GrammarBlock[]
  note?: string
  table?: { headers: string[]; rows: string[][] }
}

export const GRAMMAR_STEPS: GrammarStep[] = [
  {
    number: '১',
    title: 'Present Simple',
    intro: 'Roj-er obbhas ba shotto kotha bolar jonno',
    blocks: [
      {
        structure: 'Subject + verb (base) / verb+s (he/she/it)',
        examples: [
          { en: 'I go to school.', pron: 'আই গো টু স্কুল', mean: 'আমি স্কুলে যাই।' },
          { en: 'She likes tea.', pron: 'শি লাইকস টি', mean: "সে চা পছন্দ করে। (he/she/it-এ 's' বসে)" },
          { en: 'They work here.', pron: 'দে ওয়ার্ক হেয়ার', mean: 'তারা এখানে কাজ করে।' },
        ],
      },
    ],
  },
  {
    number: '२',
    title: 'Past Simple',
    intro: 'Already hoye geche emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + verb2 (past form)',
        examples: [
          { en: 'I went to school.', pron: 'আই ওয়েন্ট টু স্কুল', mean: 'আমি স্কুলে গিয়েছিলাম। (go → went)' },
          { en: 'She liked tea.', pron: 'শি লাইকড টি', mean: 'সে চা পছন্দ করেছিল। (like → liked)' },
          { en: 'They worked here.', pron: 'দে ওয়ার্কড হেয়ার', mean: 'তারা এখানে কাজ করেছিল। (work → worked)' },
        ],
      },
    ],
  },
  {
    number: '३',
    title: 'Future Simple',
    intro: 'Pore hobe emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + will + verb (base)',
        examples: [
          { en: 'I will go to school.', pron: 'আই উইল গো টু স্কুল', mean: 'আমি স্কুলে যাবো।' },
          { en: 'She will like tea.', pron: 'শি উইল লাইক টি', mean: 'সে চা পছন্দ করবে।' },
          { en: 'They will work here.', pron: 'দে উইল ওয়ার্ক হেয়ার', mean: 'তারা এখানে কাজ করবে।' },
        ],
      },
    ],
  },
  {
    number: '४',
    title: 'Irregular Verb',
    intro: "Ei verb gula-r past form 'ed' add kore hoy na — alada mukhosto korte hoy",
    blocks: [],
    table: {
      headers: ['Base', 'Past', 'অর্থ'],
      rows: [
        ['go', 'went', 'যাওয়া'],
        ['eat', 'ate', 'খাওয়া'],
        ['have', 'had', 'থাকা/পাওয়া'],
        ['do', 'did', 'করা'],
        ['see', 'saw', 'দেখা'],
        ['come', 'came', 'আসা'],
        ['make', 'made', 'বানানো'],
        ['take', 'took', 'নেওয়া'],
        ['give', 'gave', 'দেওয়া'],
        ['know', 'knew', 'জানা'],
        ['say', 'said', 'বলা'],
        ['think', 'thought', 'ভাবা'],
      ],
    },
  },
  {
    number: '५',
    title: 'Negative Sentence',
    intro: '"না" bolar jonno',
    blocks: [
      {
        structure: 'Subject + do/does/did + not + verb (base)',
        examples: [
          { en: "I don't go to school.", pron: 'আই ডোন্ট গো টু স্কুল', mean: 'আমি স্কুলে যাই না। (Present)' },
          { en: "She doesn't like tea.", pron: 'শি ডাজেন্ট লাইক টি', mean: 'সে চা পছন্দ করে না। (he/she/it — doesn\'t)' },
          { en: "I didn't go to school.", pron: 'আই ডিডেন্ট গো টু স্কুল', mean: 'আমি স্কুলে যাইনি। (Past)' },
          { en: "I won't go to school.", pron: 'আই ওন্ট গো টু স্কুল', mean: 'আমি স্কুলে যাবো না। (Future)' },
        ],
      },
    ],
  },
  {
    number: '६',
    title: 'Question Sentence',
    intro: 'Proshno korar jonno',
    blocks: [
      {
        structure: 'Do/Does/Did + subject + verb (base) + ?',
        examples: [
          { en: 'Do you go to school?', pron: 'ডু ইউ গো টু স্কুল', mean: 'তুমি কি স্কুলে যাও?' },
          { en: 'Does she like tea?', pron: 'ডাজ শি লাইক টি', mean: 'সে কি চা পছন্দ করে?' },
          { en: 'Did you go to school?', pron: 'ডিড ইউ গো টু স্কুল', mean: 'তুমি কি স্কুলে গিয়েছিলে?' },
          { en: 'Will you go to school?', pron: 'উইল ইউ গো টু স্কুল', mean: 'তুমি কি স্কুলে যাবে?' },
        ],
      },
      {
        structure: 'Wh-word + do/does/did + subject + verb (base)?',
        examples: [
          { en: 'Where do you go?', pron: 'হোয়ের ডু ইউ গো', mean: 'তুমি কোথায় যাও?' },
          { en: 'What does she like?', pron: 'হোয়াট ডাজ শি লাইক', mean: 'সে কী পছন্দ করে?' },
          { en: 'Why did you go?', pron: 'হোয়াই ডিড ইউ গো', mean: 'তুমি কেন গিয়েছিলে?' },
        ],
      },
    ],
    note: 'Mukhosto rakho: does/did use korle verb-e \'s\' ba \'ed\' add hoy na — base form thake. "Does she likes tea?" ভুল, "Does she like tea?" ঠিক।',
  },
  {
    number: '७',
    title: 'Present Continuous',
    intro: 'Ekhon, ei muhurte cholche emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + am/is/are + verb+ing',
        examples: [
          { en: 'I am eating rice.', pron: 'আই অ্যাম ইটিং রাইস', mean: 'আমি এখন ভাত খাচ্ছি।' },
          { en: 'She is drinking tea.', pron: 'শি ইজ ড্রিংকিং টি', mean: 'সে এখন চা খাচ্ছে।' },
          { en: 'They are working.', pron: 'দে আর ওয়ার্কিং', mean: 'তারা এখন কাজ করছে।' },
        ],
      },
      {
        structure: 'Negative: Subject + am/is/are + not + verb+ing',
        examples: [
          { en: "She is not (isn't) drinking tea.", pron: 'শি ইজ নট (ইজেন্ট) ড্রিংকিং টি', mean: 'সে এখন চা খাচ্ছে না।' },
        ],
      },
      {
        structure: 'Question: Am/Is/Are + subject + verb+ing?',
        examples: [
          { en: 'Are you eating rice?', pron: 'আর ইউ ইটিং রাইস', mean: 'তুমি কি ভাত খাচ্ছো?' },
          { en: 'Is she drinking tea?', pron: 'ইজ শি ড্রিংকিং টি', mean: 'সে কি চা খাচ্ছে?' },
        ],
      },
    ],
    note: '"I eat rice" = roj/obbhas (habit) — "I am eating rice" = ekhon, ei muhurte (right now)',
  },
  {
    number: '८',
    title: 'Modal Verb',
    intro: 'Ability, permission, advice, obligation bolar jonno — daily conversation-e khub beshi lage',
    blocks: [
      { structure: "Subject + modal + verb (base) — 's'/'ed'/'ing' kokhono add hoy na", examples: [] },
      {
        tag: 'Can — parte para (ability) / anumoti (permission)',
        examples: [
          { en: 'I can swim.', pron: 'আই ক্যান সুইম', mean: 'আমি সাঁতার কাটতে পারি।' },
          { en: 'Can I go now?', pron: 'ক্যান আই গো নাও', mean: 'আমি কি এখন যেতে পারি?' },
        ],
      },
      {
        tag: 'Could — parto (past ability) / bhodro request',
        examples: [
          { en: 'I could swim when I was young.', pron: 'আই কুড সুইম হোয়েন আই ওয়াজ ইয়াং', mean: 'ছোটবেলায় আমি সাঁতার কাটতে পারতাম।' },
          { en: 'Could you help me?', pron: 'কুড ইউ হেল্প মি', mean: 'আপনি কি আমাকে সাহায্য করতে পারবেন? (ভদ্র request)' },
        ],
      },
      {
        tag: 'Should — uchit (advice)',
        examples: [
          { en: 'You should study.', pron: 'ইউ শুড স্টাডি', mean: 'তোমার পড়াশোনা করা উচিত।' },
          { en: "You shouldn't smoke.", pron: 'ইউ শুডেন্ট স্মোক', mean: 'তোমার ধূমপান করা উচিত না।' },
        ],
      },
      {
        tag: 'Must — obosshoi korte hobe (strong obligation)',
        examples: [
          { en: 'I must go now.', pron: 'আই মাস্ট গো নাও', mean: 'আমাকে এখন অবশ্যই যেতে হবে।' },
          { en: "You mustn't lie.", pron: 'ইউ মাসেন্ট লাই', mean: 'তুমি মিথ্যা বলতে পারবে না — কখনো না।' },
        ],
      },
    ],
    note: 'Modal-er por verb-e kono \'s\', \'ed\', \'ing\' add hoy na। "She can goes" ভুল — "She can go" ঠিক।',
  },
  {
    number: '९',
    title: 'Article (a / an / the)',
    intro: 'a/an — kono ekta jinis (unspecified) — the — nirdishto/jana jinis (specific)',
    blocks: [
      {
        structure: 'a + consonant sound, an + vowel sound (a,e,i,o,u)',
        examples: [
          { en: 'I have a book.', pron: 'আই হ্যাভ আ বুক', mean: 'আমার একটা বই আছে।' },
          { en: 'I have an apple.', pron: 'আই হ্যাভ অ্যান অ্যাপল', mean: 'আমার একটা আপেল আছে। (apple vowel sound দিয়ে শুরু — an)' },
          { en: 'The book on the table is mine.', pron: 'দ্য বুক অন দ্য টেবিল ইজ মাইন', mean: 'টেবিলের ওপর বইটা আমার। (নির্দিষ্ট বই — the)' },
        ],
      },
    ],
  },
  {
    number: '१०',
    title: 'Preposition',
    intro: 'Jaiga o shomoy bojhanor jonno',
    blocks: [
      {
        examples: [
          { en: 'The pen is in the box.', pron: 'দ্য পেন ইজ ইন দ্য বক্স', mean: 'কলমটা বাক্সের ভেতরে। (in = ভেতরে)' },
          { en: 'The book is on the table.', pron: 'দ্য বুক ইজ অন দ্য টেবিল', mean: 'বইটা টেবিলের ওপরে। (on = ওপরে)' },
          { en: 'I will meet you at 5 PM.', pron: 'আই উইল মিট ইউ অ্যাট ফাইভ পিএম', mean: 'আমি বিকেল ৫টায় তোমার সাথে দেখা করবো। (at = নির্দিষ্ট সময়/জায়গা)' },
          { en: 'This gift is for you.', pron: 'দিস গিফট ইজ ফর ইউ', mean: 'এই উপহারটা তোমার জন্য। (for = জন্য)' },
          { en: 'I am going to school.', pron: 'আই অ্যাম গোয়িং টু স্কুল', mean: 'আমি স্কুলে যাচ্ছি। (to = দিকে)' },
          { en: 'This is a gift from my friend.', pron: 'দিস ইজ আ গিফট ফ্রম মাই ফ্রেন্ড', mean: 'এটা আমার বন্ধুর কাছ থেকে পাওয়া উপহার। (from = থেকে)' },
        ],
      },
    ],
  },
  {
    number: '११',
    title: 'Connector (Conjunction)',
    intro: 'Duita sentence/word jog korar jonno',
    blocks: [
      {
        examples: [
          { en: 'I like tea and coffee.', pron: 'আই লাইক টি অ্যান্ড কফি', mean: 'আমি চা এবং কফি দুটোই পছন্দ করি। (and = এবং)' },
          { en: 'I am tired but happy.', pron: 'আই অ্যাম টায়ার্ড বাট হ্যাপি', mean: 'আমি ক্লান্ত কিন্তু খুশি। (but = কিন্তু)' },
          { en: "I couldn't come because I was sick.", pron: 'আই কুডেন্ট কাম বিকজ আই ওয়াজ সিক', mean: 'আমি আসতে পারিনি কারণ আমি অসুস্থ ছিলাম। (because = কারণ)' },
          { en: 'It was raining, so I stayed home.', pron: 'ইট ওয়াজ রেইনিং, সো আই স্টেইড হোম', mean: 'বৃষ্টি হচ্ছিল, তাই আমি বাড়িতে থেকে গেলাম। (so = তাই)' },
        ],
      },
    ],
  },
  {
    number: '१२',
    title: 'Comparative & Superlative',
    intro: 'Duita jinis compare korte (comparative) o shobcheye beshi/kom bojhate (superlative)',
    blocks: [
      {
        structure: 'Comparative: adjective + er + than — Superlative: the + adjective + est',
        examples: [
          { en: 'This bag is bigger than that one.', pron: 'দিস ব্যাগ ইজ বিগার দ্যান দ্যাট ওয়ান', mean: 'এই ব্যাগটা ওইটার চেয়ে বড়।' },
          { en: 'This is the biggest bag.', pron: 'দিস ইজ দ্য বিগেস্ট ব্যাগ', mean: 'এটা সবচেয়ে বড় ব্যাগ।' },
        ],
      },
      {
        tag: 'Irregular: good → better → best, bad → worse → worst',
        examples: [
          { en: 'This tea is better than that one.', pron: 'দিস টি ইজ বেটার দ্যান দ্যাট ওয়ান', mean: 'এই চা-টা ওইটার চেয়ে ভালো।' },
          { en: 'This is the best tea I have had.', pron: 'দিস ইজ দ্য বেস্ট টি আই হ্যাভ হ্যাড', mean: 'এটাই সবচেয়ে ভালো চা যা আমি খেয়েছি।' },
        ],
      },
    ],
  },
  {
    number: '१३',
    title: 'Time Bola',
    intro: 'Somoy jiggesh kora o bola',
    blocks: [
      {
        examples: [
          { en: 'What time is it?', pron: 'হোয়াট টাইম ইজ ইট', mean: 'এখন কয়টা বাজে?' },
          { en: "It's five o'clock.", pron: "ইটস ফাইভ ও'ক্লক", mean: 'এখন পাঁচটা বাজে।' },
          { en: "It's half past five.", pron: 'ইটস হাফ পাস্ট ফাইভ', mean: 'এখন সাড়ে পাঁচটা।' },
          { en: "It's quarter to six.", pron: 'ইটস কোয়ার্টার টু সিক্স', mean: 'ছয়টা বাজতে ১৫ মিনিট বাকি।' },
        ],
      },
    ],
  },
  {
    number: '१४',
    title: "Possessive ('s) o Plural",
    intro: "Kar jinis eta bojhate 's — ekadhik bojhate 's' add hoy",
    blocks: [
      {
        structure: "Possessive: Name/Noun + 's + jinis",
        examples: [
          { en: "This is Rahim's book.", pron: "দিস ইজ রহিম'স বুক", mean: 'এটা রহিমের বই।' },
          { en: "That is my sister's phone.", pron: "দ্যাট ইজ মাই সিস্টার'স ফোন", mean: 'ওটা আমার বোনের ফোন।' },
        ],
      },
      {
        structure: 'Plural: noun + s (ekadhik bojhate)',
        examples: [
          { en: 'I have two books.', pron: 'আই হ্যাভ টু বুকস', mean: 'আমার দুইটা বই আছে।' },
          { en: 'There are three children.', pron: 'দেয়ার আর থ্রি চিলড্রেন', mean: 'সেখানে তিনটা বাচ্চা আছে। (child → children, irregular)' },
        ],
      },
    ],
  },
  {
    number: '१५',
    title: 'Past Continuous',
    intro: 'Otite kono nirdishto somoy-e cholche emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + was/were + verb+ing',
        examples: [
          { en: 'I was eating rice at 8 PM.', pron: 'আই ওয়াজ ইটিং রাইস অ্যাট এইট পিএম', mean: 'রাত ৮টায় আমি ভাত খাচ্ছিলাম।' },
          { en: 'They were working when I called.', pron: 'দে ওয়ার ওয়ার্কিং হোয়েন আই কল্ড', mean: 'আমি কল করার সময় তারা কাজ করছিল।' },
        ],
      },
    ],
    note: 'was: I/He/She/It — were: You/We/They',
  },
]
