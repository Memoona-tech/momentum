export interface MotivationQuote {
  text: string;
  author: string;
  theme: "Consistency" | "Discipline" | "Focus" | "Mastery" | "Resilience";
}

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant",
    theme: "Mastery",
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    theme: "Consistency",
  },
  {
    text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    author: "John C. Maxwell",
    theme: "Discipline",
  },
  {
    text: "First forget inspiration. Habit is more dependable. Habit will sustain you whether you are inspired or not.",
    author: "Octavia Butler",
    theme: "Consistency",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    theme: "Resilience",
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    theme: "Consistency",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    theme: "Resilience",
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
    theme: "Consistency",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    theme: "Discipline",
  },
  {
    text: "Continuous effort — not strength or intelligence — is the key to unlocking our potential.",
    author: "Winston Churchill",
    theme: "Resilience",
  },
  {
    text: "Atomic habits are the building blocks of remarkable results.",
    author: "James Clear",
    theme: "Mastery",
  },
  {
    text: "No man is free who cannot command himself.",
    author: "Pythagoras",
    theme: "Discipline",
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    theme: "Focus",
  },
  {
    text: "Consistency is the DNA of mastery.",
    author: "Robin Sharma",
    theme: "Mastery",
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery",
    theme: "Focus",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    theme: "Focus",
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    theme: "Resilience",
  },
  {
    text: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock",
    theme: "Consistency",
  },
  {
    text: "Energy flows where attention goes.",
    author: "Tony Robbins",
    theme: "Focus",
  },
  {
    text: "Be not afraid of going slowly, be afraid only of standing still.",
    author: "Chinese Proverb",
    theme: "Resilience",
  },
  {
    text: "Self-discipline begins with the mastery of your thoughts.",
    author: "Napoleon Hill",
    theme: "Discipline",
  },
  {
    text: "Focus is a muscle. The more you protect it, the stronger it grows.",
    author: "Cal Newport",
    theme: "Focus",
  },
  {
    text: "Great acts are made up of small deeds.",
    author: "Lao Tzu",
    theme: "Consistency",
  },
];

export function getDailyQuote(dateStr?: string): MotivationQuote {
  const targetDate = dateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = (hash * 31 + targetDate.charCodeAt(i)) >>> 0;
  }
  const index = hash % MOTIVATION_QUOTES.length;
  return MOTIVATION_QUOTES[index];
}
