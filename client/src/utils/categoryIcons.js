export const CATEGORIES = [
  { name: 'Food',          emoji: '🍜', color: '#FF6B8A' },
  { name: 'Transport',     emoji: '🚗', color: '#FFB547' },
  { name: 'Shopping',      emoji: '🛍️', color: '#7C5CFF' },
  { name: 'Entertainment', emoji: '🎬', color: '#38BDF8' },
  { name: 'Health',        emoji: '💊', color: '#00E5A0' },
  { name: 'Education',     emoji: '📚', color: '#A78BFA' },
  { name: 'Subscriptions', emoji: '📱', color: '#FB923C' },
  { name: 'Utilities',     emoji: '⚡', color: '#FACC15' },
  { name: 'Rent',          emoji: '🏠', color: '#60A5FA' },
  { name: 'Travel',        emoji: '✈️', color: '#34D399' },
  { name: 'Other',         emoji: '💸', color: '#9CA3AF' },
];

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking'];

export const getCategoryInfo = (name) => {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
};

export const CHART_COLORS = ['#7C5CFF', '#00E5A0', '#FF6B8A', '#FFB547', '#38BDF8', '#A78BFA', '#FB923C', '#FACC15', '#60A5FA', '#34D399', '#9CA3AF'];
