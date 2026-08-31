export interface VocabWord {
  en: string
  pron: string
  mean: string
}

export interface VocabCategory {
  name: string
  words: VocabWord[]
}

export const VOCAB: VocabCategory[] = [
  {
    "name": "Pronoun",
    "words": [
      {
        "en": "I",
        "pron": "আই",
        "mean": "আমি"
      },
      {
        "en": "You",
        "pron": "ইউ",
        "mean": "তুমি/আপনি"
      },
      {
        "en": "He",
        "pron": "হি",
        "mean": "সে (পুরুষ)"
      },
      {
        "en": "She",
        "pron": "শি",
        "mean": "সে (মহিলা)"
      },
      {
        "en": "We",
        "pron": "উই",
        "mean": "আমরা"
      },
      {
        "en": "They",
        "pron": "দে",
        "mean": "তারা"
      },
      {
        "en": "It",
        "pron": "ইট",
        "mean": "এটা"
      },
      {
        "en": "My",
        "pron": "মাই",
        "mean": "আমার"
      },
      {
        "en": "Your",
        "pron": "ইয়োর",
        "mean": "তোমার"
      },
      {
        "en": "His/Her",
        "pron": "হিজ/হার",
        "mean": "তার"
      }
    ]
  },
  {
    "name": "Common Verb",
    "words": [
      {
        "en": "Am/Is/Are",
        "pron": "অ্যাম/ইজ/আর",
        "mean": "হওয়া (হচ্ছি/আছে)"
      },
      {
        "en": "Go",
        "pron": "গো",
        "mean": "যাওয়া"
      },
      {
        "en": "Come",
        "pron": "কাম",
        "mean": "আসা"
      },
      {
        "en": "Eat",
        "pron": "ইট",
        "mean": "খাওয়া"
      },
      {
        "en": "Drink",
        "pron": "ড্রিংক",
        "mean": "পান করা"
      },
      {
        "en": "Want",
        "pron": "ওয়ান্ট",
        "mean": "চাওয়া"
      },
      {
        "en": "Have",
        "pron": "হ্যাভ",
        "mean": "থাকা/পাওয়া"
      },
      {
        "en": "Like",
        "pron": "লাইক",
        "mean": "ভালো লাগা"
      },
      {
        "en": "Need",
        "pron": "নিড",
        "mean": "দরকার"
      },
      {
        "en": "Do",
        "pron": "ডু",
        "mean": "করা"
      },
      {
        "en": "Make",
        "pron": "মেক",
        "mean": "বানানো"
      },
      {
        "en": "Say",
        "pron": "সে",
        "mean": "বলা"
      },
      {
        "en": "Know",
        "pron": "নো",
        "mean": "জানা"
      },
      {
        "en": "Think",
        "pron": "থিংক",
        "mean": "ভাবা"
      },
      {
        "en": "See",
        "pron": "সি",
        "mean": "দেখা"
      },
      {
        "en": "Give",
        "pron": "গিভ",
        "mean": "দেওয়া"
      },
      {
        "en": "Take",
        "pron": "টেক",
        "mean": "নেওয়া"
      },
      {
        "en": "Work",
        "pron": "ওয়ার্ক",
        "mean": "কাজ করা"
      },
      {
        "en": "Sleep",
        "pron": "স্লিপ",
        "mean": "ঘুমানো"
      },
      {
        "en": "Speak",
        "pron": "স্পিক",
        "mean": "কথা বলা"
      },
      {
        "en": "Understand",
        "pron": "আন্ডারস্ট্যান্ড",
        "mean": "বোঝা"
      },
      {
        "en": "Help",
        "pron": "হেল্প",
        "mean": "সাহায্য করা"
      }
    ]
  },
  {
    "name": "Question Word",
    "words": [
      {
        "en": "What",
        "pron": "হোয়াট",
        "mean": "কী"
      },
      {
        "en": "Where",
        "pron": "হোয়ের",
        "mean": "কোথায়"
      },
      {
        "en": "When",
        "pron": "হোয়েন",
        "mean": "কখন"
      },
      {
        "en": "Who",
        "pron": "হু",
        "mean": "কে"
      },
      {
        "en": "Why",
        "pron": "হোয়াই",
        "mean": "কেন"
      },
      {
        "en": "How",
        "pron": "হাউ",
        "mean": "কীভাবে"
      },
      {
        "en": "Which",
        "pron": "হুইচ",
        "mean": "কোনটা"
      },
      {
        "en": "How much",
        "pron": "হাউ মাচ",
        "mean": "কত (দাম)"
      },
      {
        "en": "How many",
        "pron": "হাউ মেনি",
        "mean": "কতগুলো"
      }
    ]
  },
  {
    "name": "Time Word",
    "words": [
      {
        "en": "Today",
        "pron": "টুডে",
        "mean": "আজ"
      },
      {
        "en": "Tomorrow",
        "pron": "টুমরো",
        "mean": "আগামীকাল"
      },
      {
        "en": "Yesterday",
        "pron": "ইয়েস্টারডে",
        "mean": "গতকাল"
      },
      {
        "en": "Now",
        "pron": "নাউ",
        "mean": "এখন"
      },
      {
        "en": "Later",
        "pron": "লেটার",
        "mean": "পরে"
      },
      {
        "en": "Morning",
        "pron": "মর্নিং",
        "mean": "সকাল"
      },
      {
        "en": "Night",
        "pron": "নাইট",
        "mean": "রাত"
      }
    ]
  },
  {
    "name": "Common Noun",
    "words": [
      {
        "en": "House",
        "pron": "হাউস",
        "mean": "বাড়ি"
      },
      {
        "en": "Food",
        "pron": "ফুড",
        "mean": "খাবার"
      },
      {
        "en": "Water",
        "pron": "ওয়াটার",
        "mean": "পানি"
      },
      {
        "en": "Money",
        "pron": "মানি",
        "mean": "টাকা"
      },
      {
        "en": "Time",
        "pron": "টাইম",
        "mean": "সময়"
      },
      {
        "en": "Work",
        "pron": "ওয়ার্ক",
        "mean": "কাজ"
      },
      {
        "en": "Family",
        "pron": "ফ্যামিলি",
        "mean": "পরিবার"
      },
      {
        "en": "Friend",
        "pron": "ফ্রেন্ড",
        "mean": "বন্ধু"
      },
      {
        "en": "School",
        "pron": "স্কুল",
        "mean": "স্কুল"
      },
      {
        "en": "Phone",
        "pron": "ফোন",
        "mean": "ফোন"
      }
    ]
  },
  {
    "name": "Adjective",
    "words": [
      {
        "en": "Good",
        "pron": "গুড",
        "mean": "ভালো"
      },
      {
        "en": "Bad",
        "pron": "ব্যাড",
        "mean": "খারাপ"
      },
      {
        "en": "Big",
        "pron": "বিগ",
        "mean": "বড়"
      },
      {
        "en": "Small",
        "pron": "স্মল",
        "mean": "ছোট"
      },
      {
        "en": "Happy",
        "pron": "হ্যাপি",
        "mean": "খুশি"
      },
      {
        "en": "Sad",
        "pron": "স্যাড",
        "mean": "দুঃখী"
      },
      {
        "en": "Easy",
        "pron": "ইজি",
        "mean": "সহজ"
      },
      {
        "en": "Hard/Difficult",
        "pron": "হার্ড/ডিফিকাল্ট",
        "mean": "কঠিন"
      },
      {
        "en": "Fast",
        "pron": "ফাস্ট",
        "mean": "দ্রুত"
      },
      {
        "en": "Slow",
        "pron": "স্লো",
        "mean": "ধীর"
      }
    ]
  },
  {
    "name": "Daily Phrase",
    "words": [
      {
        "en": "How are you?",
        "pron": "হাউ আর ইউ",
        "mean": "তুমি কেমন আছো?"
      },
      {
        "en": "I am fine",
        "pron": "আই অ্যাম ফাইন",
        "mean": "আমি ভালো আছি"
      },
      {
        "en": "Thank you",
        "pron": "থ্যাংক ইউ",
        "mean": "ধন্যবাদ"
      },
      {
        "en": "Please",
        "pron": "প্লিজ",
        "mean": "দয়া করে"
      },
      {
        "en": "Sorry",
        "pron": "সরি",
        "mean": "দুঃখিত"
      },
      {
        "en": "Excuse me",
        "pron": "এক্সকিউজ মি",
        "mean": "মাফ করবেন"
      },
      {
        "en": "I don't know",
        "pron": "আই ডোন্ট নো",
        "mean": "আমি জানি না"
      },
      {
        "en": "I don't understand",
        "pron": "আই ডোন্ট আন্ডারস্ট্যান্ড",
        "mean": "আমি বুঝি না"
      },
      {
        "en": "Can you help me?",
        "pron": "ক্যান ইউ হেল্প মি",
        "mean": "তুমি কি আমাকে সাহায্য করতে পারবে?"
      },
      {
        "en": "What is your name?",
        "pron": "হোয়াট ইজ ইয়োর নেম",
        "mean": "তোমার নাম কী?"
      },
      {
        "en": "My name is...",
        "pron": "মাই নেম ইজ...",
        "mean": "আমার নাম..."
      },
      {
        "en": "Nice to meet you",
        "pron": "নাইস টু মিট ইউ",
        "mean": "তোমার সাথে দেখা হয়ে ভালো লাগলো"
      },
      {
        "en": "See you later",
        "pron": "সি ইউ লেটার",
        "mean": "পরে দেখা হবে"
      },
      {
        "en": "Let's go",
        "pron": "লেটস গো",
        "mean": "চলো যাই"
      },
      {
        "en": "Wait a minute",
        "pron": "ওয়েট আ মিনিট",
        "mean": "একটু অপেক্ষা করো"
      },
      {
        "en": "No problem",
        "pron": "নো প্রবলেম",
        "mean": "কোনো সমস্যা নেই"
      }
    ]
  },
  {
    "name": "Number",
    "words": [
      {
        "en": "One",
        "pron": "ওয়ান",
        "mean": "এক"
      },
      {
        "en": "Two",
        "pron": "টু",
        "mean": "দুই"
      },
      {
        "en": "Three",
        "pron": "থ্রি",
        "mean": "তিন"
      },
      {
        "en": "Four",
        "pron": "ফোর",
        "mean": "চার"
      },
      {
        "en": "Five",
        "pron": "ফাইভ",
        "mean": "পাঁচ"
      },
      {
        "en": "Six",
        "pron": "সিক্স",
        "mean": "ছয়"
      },
      {
        "en": "Seven",
        "pron": "সেভেন",
        "mean": "সাত"
      },
      {
        "en": "Eight",
        "pron": "এইট",
        "mean": "আট"
      },
      {
        "en": "Nine",
        "pron": "নাইন",
        "mean": "নয়"
      },
      {
        "en": "Ten",
        "pron": "টেন",
        "mean": "দশ"
      },
      {
        "en": "Hundred",
        "pron": "হানড্রেড",
        "mean": "একশো"
      },
      {
        "en": "Thousand",
        "pron": "থাউজেন্ড",
        "mean": "হাজার"
      }
    ]
  },
  {
    "name": "Day & Week",
    "words": [
      {
        "en": "Sunday",
        "pron": "সানডে",
        "mean": "রবিবার"
      },
      {
        "en": "Monday",
        "pron": "মানডে",
        "mean": "সোমবার"
      },
      {
        "en": "Tuesday",
        "pron": "টুজডে",
        "mean": "মঙ্গলবার"
      },
      {
        "en": "Wednesday",
        "pron": "ওয়েনসডে",
        "mean": "বুধবার"
      },
      {
        "en": "Thursday",
        "pron": "থার্সডে",
        "mean": "বৃহস্পতিবার"
      },
      {
        "en": "Friday",
        "pron": "ফ্রাইডে",
        "mean": "শুক্রবার"
      },
      {
        "en": "Saturday",
        "pron": "স্যাটারডে",
        "mean": "শনিবার"
      },
      {
        "en": "Week",
        "pron": "উইক",
        "mean": "সপ্তাহ"
      },
      {
        "en": "Month",
        "pron": "মান্থ",
        "mean": "মাস"
      },
      {
        "en": "Year",
        "pron": "ইয়ার",
        "mean": "বছর"
      }
    ]
  },
  {
    "name": "Family Member",
    "words": [
      {
        "en": "Father",
        "pron": "ফাদার",
        "mean": "বাবা"
      },
      {
        "en": "Mother",
        "pron": "মাদার",
        "mean": "মা"
      },
      {
        "en": "Brother",
        "pron": "ব্রাদার",
        "mean": "ভাই"
      },
      {
        "en": "Sister",
        "pron": "সিস্টার",
        "mean": "বোন"
      },
      {
        "en": "Son",
        "pron": "সান",
        "mean": "ছেলে"
      },
      {
        "en": "Daughter",
        "pron": "ডটার",
        "mean": "মেয়ে"
      },
      {
        "en": "Husband",
        "pron": "হাজব্যান্ড",
        "mean": "স্বামী"
      },
      {
        "en": "Wife",
        "pron": "ওয়াইফ",
        "mean": "স্ত্রী"
      },
      {
        "en": "Child",
        "pron": "চাইল্ড",
        "mean": "সন্তান"
      }
    ]
  },
  {
    "name": "Shopping & Money",
    "words": [
      {
        "en": "Price",
        "pron": "প্রাইস",
        "mean": "দাম"
      },
      {
        "en": "Cheap",
        "pron": "চিপ",
        "mean": "সস্তা"
      },
      {
        "en": "Expensive",
        "pron": "এক্সপেন্সিভ",
        "mean": "দামি"
      },
      {
        "en": "Buy",
        "pron": "বাই",
        "mean": "কেনা"
      },
      {
        "en": "Sell",
        "pron": "সেল",
        "mean": "বিক্রি করা"
      },
      {
        "en": "Shop/Market",
        "pron": "শপ/মার্কেট",
        "mean": "দোকান/বাজার"
      },
      {
        "en": "Discount",
        "pron": "ডিসকাউন্ট",
        "mean": "ছাড়"
      },
      {
        "en": "Bill/Receipt",
        "pron": "বিল/রিসিট",
        "mean": "রশিদ"
      }
    ]
  },
  {
    "name": "Direction & Place",
    "words": [
      {
        "en": "Left",
        "pron": "লেফট",
        "mean": "বাম"
      },
      {
        "en": "Right",
        "pron": "রাইট",
        "mean": "ডান"
      },
      {
        "en": "Straight",
        "pron": "স্ট্রেইট",
        "mean": "সোজা"
      },
      {
        "en": "Near",
        "pron": "নিয়ার",
        "mean": "কাছে"
      },
      {
        "en": "Far",
        "pron": "ফার",
        "mean": "দূরে"
      },
      {
        "en": "Here",
        "pron": "হেয়ার",
        "mean": "এখানে"
      },
      {
        "en": "There",
        "pron": "দেয়ার",
        "mean": "ওখানে"
      },
      {
        "en": "Road/Street",
        "pron": "রোড/স্ট্রিট",
        "mean": "রাস্তা"
      }
    ]
  },
  {
    "name": "Weather",
    "words": [
      {
        "en": "Hot",
        "pron": "হট",
        "mean": "গরম"
      },
      {
        "en": "Cold",
        "pron": "কোল্ড",
        "mean": "ঠান্ডা"
      },
      {
        "en": "Rain",
        "pron": "রেইন",
        "mean": "বৃষ্টি"
      },
      {
        "en": "Sun",
        "pron": "সান",
        "mean": "রোদ"
      },
      {
        "en": "Wind",
        "pron": "উইন্ড",
        "mean": "বাতাস"
      },
      {
        "en": "Weather",
        "pron": "ওয়েদার",
        "mean": "আবহাওয়া"
      }
    ]
  },
  {
    "name": "Work & Office",
    "words": [
      {
        "en": "Job",
        "pron": "জব",
        "mean": "চাকরি"
      },
      {
        "en": "Office",
        "pron": "অফিস",
        "mean": "অফিস"
      },
      {
        "en": "Meeting",
        "pron": "মিটিং",
        "mean": "সভা"
      },
      {
        "en": "Boss",
        "pron": "বস",
        "mean": "মালিক/বস"
      },
      {
        "en": "Salary",
        "pron": "স্যালারি",
        "mean": "বেতন"
      },
      {
        "en": "Deadline",
        "pron": "ডেডলাইন",
        "mean": "শেষ সময়সীমা"
      },
      {
        "en": "Busy",
        "pron": "বিজি",
        "mean": "ব্যস্ত"
      },
      {
        "en": "Free (time)",
        "pron": "ফ্রি",
        "mean": "অবসর"
      }
    ]
  },
  {
    "name": "Feeling",
    "words": [
      {
        "en": "Angry",
        "pron": "অ্যাংরি",
        "mean": "রাগান্বিত"
      },
      {
        "en": "Tired",
        "pron": "টায়ার্ড",
        "mean": "ক্লান্ত"
      },
      {
        "en": "Excited",
        "pron": "এক্সাইটেড",
        "mean": "উত্তেজিত"
      },
      {
        "en": "Bored",
        "pron": "বোর্ড",
        "mean": "একঘেয়ে লাগা"
      },
      {
        "en": "Worried",
        "pron": "ওয়ারিড",
        "mean": "চিন্তিত"
      },
      {
        "en": "Scared",
        "pron": "স্কেয়ার্ড",
        "mean": "ভয় পাওয়া"
      },
      {
        "en": "Surprised",
        "pron": "সারপ্রাইজড",
        "mean": "অবাক"
      },
      {
        "en": "Nervous",
        "pron": "নার্ভাস",
        "mean": "নার্ভাস"
      },
      {
        "en": "Confused",
        "pron": "কনফিউজড",
        "mean": "বিভ্রান্ত"
      },
      {
        "en": "Proud",
        "pron": "প্রাউড",
        "mean": "গর্বিত"
      },
      {
        "en": "Confident",
        "pron": "কনফিডেন্ট",
        "mean": "আত্মবিশ্বাসী"
      },
      {
        "en": "Comfortable",
        "pron": "কমফোর্টেবল",
        "mean": "আরামদায়ক"
      }
    ]
  },
  {
    "name": "Body Part",
    "words": [
      {
        "en": "Head",
        "pron": "হেড",
        "mean": "মাথা"
      },
      {
        "en": "Eye",
        "pron": "আই",
        "mean": "চোখ"
      },
      {
        "en": "Ear",
        "pron": "ইয়ার",
        "mean": "কান"
      },
      {
        "en": "Nose",
        "pron": "নোজ",
        "mean": "নাক"
      },
      {
        "en": "Mouth",
        "pron": "মাউথ",
        "mean": "মুখ"
      },
      {
        "en": "Hand",
        "pron": "হ্যান্ড",
        "mean": "হাত"
      },
      {
        "en": "Leg",
        "pron": "লেগ",
        "mean": "পা"
      },
      {
        "en": "Stomach",
        "pron": "স্টমাক",
        "mean": "পেট"
      },
      {
        "en": "Back",
        "pron": "ব্যাক",
        "mean": "পিঠ"
      },
      {
        "en": "Heart",
        "pron": "হার্ট",
        "mean": "হৃদয়"
      },
      {
        "en": "Hair",
        "pron": "হেয়ার",
        "mean": "চুল"
      },
      {
        "en": "Tooth",
        "pron": "টুথ",
        "mean": "দাঁত"
      }
    ]
  },
  {
    "name": "Food Item",
    "words": [
      {
        "en": "Rice",
        "pron": "রাইস",
        "mean": "ভাত"
      },
      {
        "en": "Bread",
        "pron": "ব্রেড",
        "mean": "রুটি"
      },
      {
        "en": "Egg",
        "pron": "এগ",
        "mean": "ডিম"
      },
      {
        "en": "Fish",
        "pron": "ফিশ",
        "mean": "মাছ"
      },
      {
        "en": "Meat",
        "pron": "মিট",
        "mean": "মাংস"
      },
      {
        "en": "Vegetable",
        "pron": "ভেজিটেবল",
        "mean": "সবজি"
      },
      {
        "en": "Fruit",
        "pron": "ফ্রুট",
        "mean": "ফল"
      },
      {
        "en": "Milk",
        "pron": "মিল্ক",
        "mean": "দুধ"
      },
      {
        "en": "Sugar",
        "pron": "সুগার",
        "mean": "চিনি"
      },
      {
        "en": "Salt",
        "pron": "সল্ট",
        "mean": "লবণ"
      },
      {
        "en": "Oil",
        "pron": "অয়েল",
        "mean": "তেল"
      },
      {
        "en": "Chicken",
        "pron": "চিকেন",
        "mean": "মুরগির মাংস"
      }
    ]
  },
  {
    "name": "Clothes",
    "words": [
      {
        "en": "Shirt",
        "pron": "শার্ট",
        "mean": "শার্ট"
      },
      {
        "en": "Pant",
        "pron": "প্যান্ট",
        "mean": "প্যান্ট"
      },
      {
        "en": "Shoe",
        "pron": "শু",
        "mean": "জুতা"
      },
      {
        "en": "Dress",
        "pron": "ড্রেস",
        "mean": "পোশাক"
      },
      {
        "en": "Cap",
        "pron": "ক্যাপ",
        "mean": "টুপি"
      },
      {
        "en": "Bag",
        "pron": "ব্যাগ",
        "mean": "ব্যাগ"
      },
      {
        "en": "Watch",
        "pron": "ওয়াচ",
        "mean": "ঘড়ি"
      },
      {
        "en": "Glasses",
        "pron": "গ্লাসেস",
        "mean": "চশমা"
      }
    ]
  },
  {
    "name": "Color",
    "words": [
      {
        "en": "Red",
        "pron": "রেড",
        "mean": "লাল"
      },
      {
        "en": "Blue",
        "pron": "ব্লু",
        "mean": "নীল"
      },
      {
        "en": "Green",
        "pron": "গ্রিন",
        "mean": "সবুজ"
      },
      {
        "en": "Yellow",
        "pron": "ইয়েলো",
        "mean": "হলুদ"
      },
      {
        "en": "Black",
        "pron": "ব্ল্যাক",
        "mean": "কালো"
      },
      {
        "en": "White",
        "pron": "হোয়াইট",
        "mean": "সাদা"
      },
      {
        "en": "Orange",
        "pron": "অরেঞ্জ",
        "mean": "কমলা"
      },
      {
        "en": "Pink",
        "pron": "পিংক",
        "mean": "গোলাপি"
      },
      {
        "en": "Brown",
        "pron": "ব্রাউন",
        "mean": "বাদামি"
      },
      {
        "en": "Grey",
        "pron": "গ্রে",
        "mean": "ধূসর"
      }
    ]
  },
  {
    "name": "Animal",
    "words": [
      {
        "en": "Dog",
        "pron": "ডগ",
        "mean": "কুকুর"
      },
      {
        "en": "Cat",
        "pron": "ক্যাট",
        "mean": "বিড়াল"
      },
      {
        "en": "Cow",
        "pron": "কাউ",
        "mean": "গরু"
      },
      {
        "en": "Bird",
        "pron": "বার্ড",
        "mean": "পাখি"
      },
      {
        "en": "Goat",
        "pron": "গোট",
        "mean": "ছাগল"
      },
      {
        "en": "Elephant",
        "pron": "এলিফ্যান্ট",
        "mean": "হাতি"
      },
      {
        "en": "Tiger",
        "pron": "টাইগার",
        "mean": "বাঘ"
      },
      {
        "en": "Snake",
        "pron": "স্নেক",
        "mean": "সাপ"
      },
      {
        "en": "Horse",
        "pron": "হর্স",
        "mean": "ঘোড়া"
      },
      {
        "en": "Duck",
        "pron": "ডাক",
        "mean": "হাঁস"
      }
    ]
  },
  {
    "name": "Transport",
    "words": [
      {
        "en": "Car",
        "pron": "কার",
        "mean": "গাড়ি"
      },
      {
        "en": "Bus",
        "pron": "বাস",
        "mean": "বাস"
      },
      {
        "en": "Train",
        "pron": "ট্রেইন",
        "mean": "ট্রেন"
      },
      {
        "en": "Bicycle",
        "pron": "বাইসাইকেল",
        "mean": "সাইকেল"
      },
      {
        "en": "Plane",
        "pron": "প্লেন",
        "mean": "বিমান"
      },
      {
        "en": "Rickshaw",
        "pron": "রিকশা",
        "mean": "রিকশা"
      },
      {
        "en": "Boat",
        "pron": "বোট",
        "mean": "নৌকা"
      },
      {
        "en": "Ship",
        "pron": "শিপ",
        "mean": "জাহাজ"
      }
    ]
  },
  {
    "name": "Technology",
    "words": [
      {
        "en": "Computer",
        "pron": "কম্পিউটার",
        "mean": "কম্পিউটার"
      },
      {
        "en": "Internet",
        "pron": "ইন্টারনেট",
        "mean": "ইন্টারনেট"
      },
      {
        "en": "Email",
        "pron": "ইমেইল",
        "mean": "ইমেইল"
      },
      {
        "en": "Message",
        "pron": "মেসেজ",
        "mean": "বার্তা"
      },
      {
        "en": "Application",
        "pron": "অ্যাপ্লিকেশন",
        "mean": "অ্যাপ"
      },
      {
        "en": "Password",
        "pron": "পাসওয়ার্ড",
        "mean": "পাসওয়ার্ড"
      },
      {
        "en": "Charger",
        "pron": "চার্জার",
        "mean": "চার্জার"
      },
      {
        "en": "Battery",
        "pron": "ব্যাটারি",
        "mean": "ব্যাটারি"
      },
      {
        "en": "Wifi",
        "pron": "ওয়াইফাই",
        "mean": "ওয়াইফাই"
      },
      {
        "en": "Camera",
        "pron": "ক্যামেরা",
        "mean": "ক্যামেরা"
      }
    ]
  },
  {
    "name": "Health",
    "words": [
      {
        "en": "Doctor",
        "pron": "ডক্টর",
        "mean": "ডাক্তার"
      },
      {
        "en": "Hospital",
        "pron": "হসপিটাল",
        "mean": "হাসপাতাল"
      },
      {
        "en": "Medicine",
        "pron": "মেডিসিন",
        "mean": "ওষুধ"
      },
      {
        "en": "Sick",
        "pron": "সিক",
        "mean": "অসুস্থ"
      },
      {
        "en": "Fever",
        "pron": "ফিভার",
        "mean": "জ্বর"
      },
      {
        "en": "Pain",
        "pron": "পেইন",
        "mean": "ব্যথা"
      },
      {
        "en": "Headache",
        "pron": "হেডএক",
        "mean": "মাথাব্যথা"
      },
      {
        "en": "Healthy",
        "pron": "হেলদি",
        "mean": "সুস্থ"
      },
      {
        "en": "Rest",
        "pron": "রেস্ট",
        "mean": "বিশ্রাম"
      }
    ]
  },
  {
    "name": "Nature",
    "words": [
      {
        "en": "Sky",
        "pron": "স্কাই",
        "mean": "আকাশ"
      },
      {
        "en": "Tree",
        "pron": "ট্রি",
        "mean": "গাছ"
      },
      {
        "en": "River",
        "pron": "রিভার",
        "mean": "নদী"
      },
      {
        "en": "Sea",
        "pron": "সি",
        "mean": "সমুদ্র"
      },
      {
        "en": "Mountain",
        "pron": "মাউন্টেন",
        "mean": "পাহাড়"
      },
      {
        "en": "Flower",
        "pron": "ফ্লাওয়ার",
        "mean": "ফুল"
      },
      {
        "en": "Stone",
        "pron": "স্টোন",
        "mean": "পাথর"
      },
      {
        "en": "Air",
        "pron": "এয়ার",
        "mean": "বাতাস"
      },
      {
        "en": "Fire",
        "pron": "ফায়ার",
        "mean": "আগুন"
      },
      {
        "en": "Earth",
        "pron": "আর্থ",
        "mean": "পৃথিবী"
      }
    ]
  },
  {
    "name": "Occupation",
    "words": [
      {
        "en": "Teacher",
        "pron": "টিচার",
        "mean": "শিক্ষক"
      },
      {
        "en": "Engineer",
        "pron": "ইঞ্জিনিয়ার",
        "mean": "প্রকৌশলী"
      },
      {
        "en": "Farmer",
        "pron": "ফার্মার",
        "mean": "কৃষক"
      },
      {
        "en": "Driver",
        "pron": "ড্রাইভার",
        "mean": "চালক"
      },
      {
        "en": "Police",
        "pron": "পুলিশ",
        "mean": "পুলিশ"
      },
      {
        "en": "Businessman",
        "pron": "বিজনেসম্যান",
        "mean": "ব্যবসায়ী"
      },
      {
        "en": "Student",
        "pron": "স্টুডেন্ট",
        "mean": "ছাত্র/ছাত্রী"
      },
      {
        "en": "Lawyer",
        "pron": "লইয়ার",
        "mean": "আইনজীবী"
      },
      {
        "en": "Nurse",
        "pron": "নার্স",
        "mean": "নার্স"
      },
      {
        "en": "Cook",
        "pron": "কুক",
        "mean": "রাঁধুনি"
      }
    ]
  },
  {
    "name": "Adverb",
    "words": [
      {
        "en": "Always",
        "pron": "অলওয়েজ",
        "mean": "সবসময়"
      },
      {
        "en": "Never",
        "pron": "নেভার",
        "mean": "কখনো না"
      },
      {
        "en": "Sometimes",
        "pron": "সামটাইমস",
        "mean": "মাঝে মাঝে"
      },
      {
        "en": "Often",
        "pron": "অফেন",
        "mean": "প্রায়ই"
      },
      {
        "en": "Usually",
        "pron": "ইউজুয়ালি",
        "mean": "সাধারণত"
      },
      {
        "en": "Quickly",
        "pron": "কুইকলি",
        "mean": "দ্রুত"
      },
      {
        "en": "Slowly",
        "pron": "স্লোলি",
        "mean": "ধীরে"
      },
      {
        "en": "Carefully",
        "pron": "কেয়ারফুলি",
        "mean": "সাবধানে"
      },
      {
        "en": "Really",
        "pron": "রিয়েলি",
        "mean": "সত্যিই"
      },
      {
        "en": "Very",
        "pron": "ভেরি",
        "mean": "খুব"
      },
      {
        "en": "Also",
        "pron": "অলসো",
        "mean": "এছাড়াও"
      },
      {
        "en": "Again",
        "pron": "এগেইন",
        "mean": "আবার"
      }
    ]
  },
  {
    "name": "Connector Word",
    "words": [
      {
        "en": "And",
        "pron": "অ্যান্ড",
        "mean": "এবং"
      },
      {
        "en": "But",
        "pron": "বাট",
        "mean": "কিন্তু"
      },
      {
        "en": "Or",
        "pron": "অর",
        "mean": "অথবা"
      },
      {
        "en": "Because",
        "pron": "বিকজ",
        "mean": "কারণ"
      },
      {
        "en": "So",
        "pron": "সো",
        "mean": "তাই"
      },
      {
        "en": "If",
        "pron": "ইফ",
        "mean": "যদি"
      },
      {
        "en": "Although",
        "pron": "অলদো",
        "mean": "যদিও"
      },
      {
        "en": "While",
        "pron": "হোয়াইল",
        "mean": "যখন/সেসময়"
      }
    ]
  },
  {
    "name": "Spoken Phrase / Filler",
    "words": [
      {
        "en": "Well",
        "pron": "ওয়েল",
        "mean": "আচ্ছা/যাইহোক (কথা শুরু করতে)"
      },
      {
        "en": "You know",
        "pron": "ইউ নো",
        "mean": "জানোই তো"
      },
      {
        "en": "I mean",
        "pron": "আই মিন",
        "mean": "মানে"
      },
      {
        "en": "Actually",
        "pron": "অ্যাকচুয়ালি",
        "mean": "আসলে"
      },
      {
        "en": "By the way",
        "pron": "বাই দ্য ওয়ে",
        "mean": "প্রসঙ্গক্রমে"
      },
      {
        "en": "Kind of / Sort of",
        "pron": "কাইন্ড অফ/সর্ট অফ",
        "mean": "একরকম/কিছুটা"
      },
      {
        "en": "I guess",
        "pron": "আই গেস",
        "mean": "মনে হয়"
      },
      {
        "en": "Anyway",
        "pron": "এনিওয়ে",
        "mean": "যাইহোক"
      },
      {
        "en": "Basically",
        "pron": "বেসিক্যালি",
        "mean": "মূলত"
      },
      {
        "en": "Honestly",
        "pron": "অনেস্টলি",
        "mean": "সত্যি বলতে"
      }
    ]
  },
  {
    "name": "Number (11-100)",
    "words": [
      {
        "en": "Eleven",
        "pron": "ইলেভেন",
        "mean": "এগারো"
      },
      {
        "en": "Twelve",
        "pron": "টুয়েলভ",
        "mean": "বারো"
      },
      {
        "en": "Twenty",
        "pron": "টোয়েন্টি",
        "mean": "বিশ"
      },
      {
        "en": "Thirty",
        "pron": "থার্টি",
        "mean": "ত্রিশ"
      },
      {
        "en": "Forty",
        "pron": "ফোর্টি",
        "mean": "চল্লিশ"
      },
      {
        "en": "Fifty",
        "pron": "ফিফটি",
        "mean": "পঞ্চাশ"
      },
      {
        "en": "Sixty",
        "pron": "সিক্সটি",
        "mean": "ষাট"
      },
      {
        "en": "Seventy",
        "pron": "সেভেন্টি",
        "mean": "সত্তর"
      },
      {
        "en": "Eighty",
        "pron": "এইটি",
        "mean": "আশি"
      },
      {
        "en": "Ninety",
        "pron": "নাইন্টি",
        "mean": "নব্বই"
      },
      {
        "en": "First",
        "pron": "ফার্স্ট",
        "mean": "প্রথম"
      },
      {
        "en": "Second",
        "pron": "সেকেন্ড",
        "mean": "দ্বিতীয়"
      },
      {
        "en": "Third",
        "pron": "থার্ড",
        "mean": "তৃতীয়"
      }
    ]
  },
  {
    "name": "Quantity Word",
    "words": [
      {
        "en": "Some",
        "pron": "সাম",
        "mean": "কিছু (positive sentence-e)"
      },
      {
        "en": "Any",
        "pron": "এনি",
        "mean": "কিছু (negative/question-e)"
      },
      {
        "en": "Much",
        "pron": "মাচ",
        "mean": "অনেক (uncountable — water, time)"
      },
      {
        "en": "Many",
        "pron": "মেনি",
        "mean": "অনেক (countable — books, people)"
      },
      {
        "en": "A lot of",
        "pron": "আ লট অফ",
        "mean": "অনেক (dutai khetre)"
      },
      {
        "en": "A little",
        "pron": "আ লিটল",
        "mean": "একটু (uncountable)"
      },
      {
        "en": "A few",
        "pron": "আ ফিউ",
        "mean": "কয়েকটা (countable)"
      },
      {
        "en": "Enough",
        "pron": "ইনাফ",
        "mean": "যথেষ্ট"
      }
    ]
  }
]
