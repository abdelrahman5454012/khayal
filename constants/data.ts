export const LIVE_AUCTIONS = [
  {
    id: '1',
    name: 'الجواد شاهين',
    subtitle: 'ابن الفحل بدران x الأم نوف',
    currentBid: 420000,
    timeLeft: { h: 2, m: 45, s: 0 },
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
    auctionNumber: 45,
    isLive: true,
  },
  {
    id: '2',
    name: 'الجواد النسر',
    subtitle: 'ابن الفحل مجد x الأم لولوة',
    currentBid: 310000,
    timeLeft: { h: 1, m: 20, s: 0 },
    image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&q=80',
    auctionNumber: 46,
    isLive: true,
  },
];

export const UPCOMING_RACES = [
  {
    id: '1',
    name: 'كأس النيل',
    time: '17:30',
    date: 'اليوم',
    venue: 'مضمار نادي الجزيرة',
    horsesCount: 12,
    image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&q=80',
  },
  {
    id: '2',
    name: 'جائزة الإنتاج المحلي',
    time: '15:00',
    date: 'غدًا',
    venue: 'مضمار مصطفى كامل',
    horsesCount: 10,
    image: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=800&q=80',
  },
  {
    id: '3',
    name: 'كأس وزارة الزراعة',
    time: '16:00',
    date: '25 مايو',
    venue: 'مضمار طنطا',
    horsesCount: 14,
    image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&q=80',
  },
];

export const ACTIVE_AUCTIONS = [
  {
    id: '1',
    name: 'الجواد الرماح',
    currentBid: 310000,
    timeLeft: '00:05:12',
    image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&q=80',
    isLive: true,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'الجواد عزام',
    currentBid: 250000,
    timeLeft: '00:07:45',
    image: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=800&q=80',
    isLive: true,
    isFavorite: false,
  },
  {
    id: '3',
    name: 'الفرس ديم',
    currentBid: 180000,
    timeLeft: '00:12:30',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
    isLive: true,
    isFavorite: false,
  },
];

export const TOP_HORSES = [
  {
    id: '1',
    name: 'الجواد بدران',
    rating: 98,
    rank: 1,
    image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80',
  },
  {
    id: '2',
    name: 'الجواد شاهين',
    rating: 96,
    rank: 2,
    image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=400&q=80',
  },
  {
    id: '3',
    name: 'الجواد سيوف',
    rating: 94,
    rank: 3,
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80',
  },
];

export const BID_HISTORY = [
  { id: '1', bidder: 'أحمد م.', amount: 420000, time: '14:32:10', isHighest: true },
  { id: '2', bidder: 'محمود ع.', amount: 410000, time: '14:31:55', isHighest: false },
  { id: '3', bidder: 'خالد س.', amount: 400000, time: '14:31:20', isHighest: false },
  { id: '4', bidder: 'سامي ف.', amount: 390000, time: '14:30:45', isHighest: false },
  { id: '5', bidder: 'عمر ر.', amount: 380000, time: '14:30:10', isHighest: false },
];

export const formatCurrency = (amount: number) =>
  amount.toLocaleString('ar-EG') + ' ج.م';
