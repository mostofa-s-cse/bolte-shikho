export interface DialogueLine {
  speaker: 'A' | 'B' | null
  en: string
  pron: string
  mean: string
}

export interface Dialogue {
  title: string
  lines: DialogueLine[]
}

export const DIALOGUES: Dialogue[] = [
  {
    title: 'Introduction',
    lines: [
      { speaker: 'A', en: 'Hello! What is your name?', pron: 'হ্যালো! হোয়াট ইজ ইয়োর নেম', mean: 'হ্যালো, তোমার নাম কী?' },
      { speaker: 'B', en: 'Hi, my name is Rahim. And you?', pron: 'হাই, মাই নেম ইজ রহিম, অ্যান্ড ইউ', mean: 'হাই, আমার নাম রহিম, তোমার?' },
      { speaker: 'A', en: 'Nice to meet you, Rahim.', pron: 'নাইস টু মিট ইউ রহিম', mean: 'তোমার সাথে দেখা হয়ে ভালো লাগলো, রহিম।' },
      { speaker: 'B', en: 'Nice to meet you too.', pron: 'নাইস টু মিট ইউ টু', mean: 'আমারও ভালো লাগলো।' },
    ],
  },
  {
    title: 'Asking Directions',
    lines: [
      { speaker: 'A', en: 'Excuse me, where is the bus stop?', pron: 'এক্সকিউজ মি, হোয়ের ইজ দ্য বাস স্টপ', mean: 'মাফ করবেন, বাস স্টপ কোথায়?' },
      { speaker: 'B', en: 'Go straight, then turn left.', pron: 'গো স্ট্রেইট, দেন টার্ন লেফট', mean: 'সোজা যান, তারপর বামে ঘুরুন।' },
      { speaker: 'A', en: 'Is it far from here?', pron: 'ইজ ইট ফার ফ্রম হেয়ার', mean: 'এটা কি এখান থেকে দূরে?' },
      { speaker: 'B', en: "No, it's very near.", pron: 'নো, ইটস ভেরি নিয়ার', mean: 'না, এটা খুব কাছে।' },
    ],
  },
  {
    title: 'At a Shop',
    lines: [
      { speaker: 'A', en: 'How much is this shirt?', pron: 'হাউ মাচ ইজ দিস শার্ট', mean: 'এই শার্টটার দাম কত?' },
      { speaker: 'B', en: "It's five hundred taka.", pron: 'ইটস ফাইভ হানড্রেড টাকা', mean: 'এটা পাঁচশো টাকা।' },
      { speaker: 'A', en: 'Can you give a discount?', pron: 'ক্যান ইউ গিভ আ ডিসকাউন্ট', mean: 'আপনি কি একটু ছাড় দিতে পারবেন?' },
      { speaker: 'B', en: 'Okay, four hundred fifty.', pron: 'ওকে, ফোর হানড্রেড ফিফটি', mean: 'ঠিক আছে, চারশো পঞ্চাশ।' },
    ],
  },
  {
    title: 'At the Office',
    lines: [
      { speaker: 'A', en: 'Can we schedule a meeting tomorrow?', pron: 'ক্যান উই স্কেজুল আ মিটিং টুমরো', mean: 'আমরা কি আগামীকাল একটা মিটিং রাখতে পারি?' },
      { speaker: 'B', en: 'Sure, what time works for you?', pron: 'শিওর, হোয়াট টাইম ওয়ার্কস ফর ইউ', mean: 'অবশ্যই, কোন সময়টা তোমার জন্য ভালো?' },
      { speaker: 'A', en: 'How about 10 AM?', pron: 'হাউ অ্যাবাউট টেন এএম', mean: 'সকাল ১০টা কেমন হয়?' },
      { speaker: 'B', en: 'That works for me.', pron: 'দ্যাট ওয়ার্কস ফর মি', mean: 'এটা আমার জন্য ঠিক আছে।' },
    ],
  },
  {
    title: 'Self Introduction (1 minute)',
    lines: [
      { speaker: null, en: 'Hello, my name is Mostofa.', pron: 'হ্যালো, মাই নেম ইজ মোস্তফা', mean: 'হ্যালো, আমার নাম মোস্তফা।' },
      { speaker: null, en: 'I am 28 years old.', pron: 'আই অ্যাম টোয়েন্টি এইট ইয়ার্স ওল্ড', mean: 'আমার বয়স ২৮ বছর।' },
      { speaker: null, en: 'I work as a [your job].', pron: 'আই ওয়ার্ক অ্যাজ আ [ইয়োর জব]', mean: 'আমি একজন [তোমার পেশা] হিসেবে কাজ করি।' },
      { speaker: null, en: 'I live in Dhaka with my family.', pron: 'আই লিভ ইন ঢাকা উইথ মাই ফ্যামিলি', mean: 'আমি পরিবারের সাথে ঢাকায় থাকি।' },
      { speaker: null, en: 'In my free time, I like reading books.', pron: 'ইন মাই ফ্রি টাইম, আই লাইক রিডিং বুকস', mean: 'অবসর সময়ে আমি বই পড়তে পছন্দ করি।' },
      { speaker: null, en: 'I am learning English to speak more confidently.', pron: 'আই অ্যাম লার্নিং ইংলিশ টু স্পিক মোর কনফিডেন্টলি', mean: 'আমি আরও আত্মবিশ্বাসের সাথে কথা বলার জন্য ইংরেজি শিখছি।' },
    ],
  },
]
