// ─── Parimutuel Betting Engine ───────────────────────────────────────────────
// All bets go into a shared pool. Winners split the net pool proportionally.
// Platform keeps a commission cut before distributing.

export const COMMISSION_RATE = 0.15; // 15% platform cut

export interface BettingHorse {
  id: string;
  number: number;
  name: string;
  jockey: string;
  stable: string;
  totalBetsAmount: number; // EGP bet on this horse by all users
  image: string;
  lastRacePosition?: number;
  weight: number; // kg
}

export interface BettingRace {
  id: string;
  name: string;
  venue: string;
  distance: string;
  startTime: string;
  date: string;
  status: 'upcoming' | 'open' | 'running' | 'finished';
  totalPool: number;
  horses: BettingHorse[];
  winnerHorseId?: string;
  image: string;
}

export interface MyBet {
  id: string;
  raceId: string;
  raceName: string;
  horseId: string;
  horseName: string;
  amount: number;
  potentialPayout: number;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  placedAt: string;
  odds: number;
}

// ── Calculations ──────────────────────────────────────────────────────────────

export function calcOdds(totalPool: number, horseBets: number): number {
  if (horseBets === 0) return 99;
  const netPool = totalPool * (1 - COMMISSION_RATE);
  const ratio = (netPool - horseBets) / horseBets;
  return Math.max(1.1, Math.round(ratio * 10) / 10);
}

export function calcPayout(betAmount: number, totalPool: number, horseBets: number): number {
  const newPool = totalPool + betAmount;
  const newHorseBets = horseBets + betAmount;
  const netPool = newPool * (1 - COMMISSION_RATE);
  const share = betAmount / newHorseBets;
  return Math.round(share * netPool);
}

export function calcWinChance(totalPool: number, horseBets: number): number {
  if (totalPool === 0) return 0;
  return Math.round((horseBets / totalPool) * 100);
}

export function formatOdds(odds: number): string {
  return odds.toFixed(1) + 'x';
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const BETTING_RACES: BettingRace[] = [
  {
    id: '1',
    name: 'كأس النيل',
    venue: 'مضمار نادي الجزيرة',
    distance: '1600 متر',
    startTime: '17:30',
    date: 'اليوم',
    status: 'open',
    totalPool: 1240000,
    image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&q=80',
    horses: [
      { id: 'h1', number: 1, name: 'الجواد شاهين', jockey: 'محمد علي', stable: 'إسطبل النيل', totalBetsAmount: 380000, image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', lastRacePosition: 1, weight: 56 },
      { id: 'h2', number: 2, name: 'الجواد بدران', jockey: 'أحمد سامي', stable: 'إسطبل الملك', totalBetsAmount: 290000, image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&q=80', lastRacePosition: 2, weight: 57 },
      { id: 'h3', number: 3, name: 'الجواد سيوف', jockey: 'خالد رامي', stable: 'إسطبل الفجر', totalBetsAmount: 210000, image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80', lastRacePosition: 3, weight: 55 },
      { id: 'h4', number: 4, name: 'الفرس ديم', jockey: 'سامي فارس', stable: 'إسطبل الصحراء', totalBetsAmount: 190000, image: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=400&q=80', lastRacePosition: 4, weight: 54 },
      { id: 'h5', number: 5, name: 'الجواد عزام', jockey: 'عمر جمال', stable: 'إسطبل النور', totalBetsAmount: 170000, image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', lastRacePosition: 5, weight: 58 },
    ],
  },
  {
    id: '2',
    name: 'جائزة الإنتاج المحلي',
    venue: 'مضمار مصطفى كامل',
    distance: '2000 متر',
    startTime: '15:00',
    date: 'غدًا',
    status: 'upcoming',
    totalPool: 870000,
    image: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=800&q=80',
    horses: [
      { id: 'h6', number: 1, name: 'الجواد الرماح', jockey: 'طارق نور', stable: 'إسطبل الأمير', totalBetsAmount: 240000, image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&q=80', lastRacePosition: 2, weight: 56 },
      { id: 'h7', number: 2, name: 'الجواد النسر', jockey: 'حسن فؤاد', stable: 'إسطبل الصقر', totalBetsAmount: 185000, image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', lastRacePosition: 1, weight: 55 },
      { id: 'h8', number: 3, name: 'الجواد مجد', jockey: 'كريم عادل', stable: 'إسطبل المجد', totalBetsAmount: 160000, image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80', lastRacePosition: 3, weight: 57 },
      { id: 'h9', number: 4, name: 'الفرس لؤلؤ', jockey: 'أيمن سعد', stable: 'إسطبل النيل', totalBetsAmount: 145000, image: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=400&q=80', lastRacePosition: 5, weight: 54 },
      { id: 'h10', number: 5, name: 'الجواد فارس', jockey: 'ياسر حلمي', stable: 'إسطبل الفجر', totalBetsAmount: 140000, image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&q=80', lastRacePosition: 4, weight: 56 },
    ],
  },
  {
    id: '3',
    name: 'كأس وزارة الزراعة',
    venue: 'مضمار طنطا',
    distance: '1200 متر',
    startTime: '16:00',
    date: '25 مايو',
    status: 'upcoming',
    totalPool: 540000,
    image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&q=80',
    horses: [
      { id: 'h11', number: 1, name: 'الجواد ذهبي', jockey: 'محمود رضا', stable: 'إسطبل الذهب', totalBetsAmount: 150000, image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', lastRacePosition: 1, weight: 55 },
      { id: 'h12', number: 2, name: 'الجواد برق', jockey: 'علي حسن', stable: 'إسطبل البرق', totalBetsAmount: 130000, image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80', lastRacePosition: 3, weight: 56 },
      { id: 'h13', number: 3, name: 'الجواد صقر', jockey: 'نادر جمال', stable: 'إسطبل الصقر', totalBetsAmount: 110000, image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&q=80', lastRacePosition: 2, weight: 57 },
      { id: 'h14', number: 4, name: 'الفرس نجمة', jockey: 'سعد حلمي', stable: 'إسطبل النجوم', totalBetsAmount: 90000, image: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=400&q=80', lastRacePosition: 4, weight: 53 },
      { id: 'h15', number: 5, name: 'الجواد وليد', jockey: 'فيصل أمين', stable: 'إسطبل الملك', totalBetsAmount: 60000, image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', lastRacePosition: 6, weight: 58 },
    ],
  },
];

export const MY_BETS: MyBet[] = [
  {
    id: 'b1',
    raceId: '1',
    raceName: 'كأس النيل',
    horseId: 'h1',
    horseName: 'الجواد شاهين',
    amount: 5000,
    potentialPayout: 13500,
    status: 'active',
    placedAt: '14:20',
    odds: 2.7,
  },
  {
    id: 'b2',
    raceId: '2',
    raceName: 'جائزة الإنتاج المحلي',
    horseId: 'h7',
    horseName: 'الجواد النسر',
    amount: 2000,
    potentialPayout: 7800,
    status: 'active',
    placedAt: '13:45',
    odds: 3.9,
  },
  {
    id: 'b3',
    raceId: '0',
    raceName: 'كأس الربيع',
    horseId: 'hx',
    horseName: 'الجواد بدران',
    amount: 10000,
    potentialPayout: 28000,
    status: 'won',
    placedAt: 'أمس',
    odds: 2.8,
  },
  {
    id: 'b4',
    raceId: '0',
    raceName: 'جائزة الشتاء',
    horseId: 'hy',
    horseName: 'الجواد سيوف',
    amount: 3000,
    potentialPayout: 0,
    status: 'lost',
    placedAt: 'أمس',
    odds: 4.1,
  },
];

export const formatCurrencyBet = (n: number) => n.toLocaleString('ar-EG') + ' ج.م';
