-- Bets.Fun Badges Data Export
-- Generated for migration to new Neon account

-- Insert badges
INSERT INTO badges (id, name, description, icon, category, threshold, color, rarity, created_at) VALUES
(1, 'Sharp Shooter', 'Achieve 60% prediction accuracy', 'Target', 'accuracy', 60.00, '#10B981', 'common', '2025-06-08 08:25:34.711547'),
(2, 'Oracle', 'Achieve 75% prediction accuracy', 'Eye', 'accuracy', 75.00, '#3B82F6', 'rare', '2025-06-08 08:25:34.711547'),
(3, 'Prophet', 'Achieve 85% prediction accuracy', 'Crown', 'accuracy', 85.00, '#8B5CF6', 'epic', '2025-06-08 08:25:34.711547'),
(4, 'First Win', 'Earn your first $10 in winnings', 'DollarSign', 'volume', 10.00, '#10B981', 'common', '2025-06-08 08:25:34.711547'),
(5, 'High Roller', 'Earn $100 in total winnings', 'TrendingUp', 'volume', 100.00, '#3B82F6', 'rare', '2025-06-08 08:25:34.711547'),
(6, 'Market Whale', 'Earn $500 in total winnings', 'Gem', 'volume', 500.00, '#8B5CF6', 'epic', '2025-06-08 08:25:34.711547'),
(7, 'Getting Started', 'Place your first 5 bets', 'Play', 'experience', 5.00, '#10B981', 'common', '2025-06-08 08:25:34.711547'),
(8, 'Active Trader', 'Place 25 bets', 'BarChart3', 'experience', 25.00, '#3B82F6', 'rare', '2025-06-08 08:25:34.711547'),
(9, 'Market Veteran', 'Place 100 bets', 'Award', 'experience', 100.00, '#8B5CF6', 'epic', '2025-06-08 08:25:34.711547');

-- Update sequence for badges
SELECT setval('badges_id_seq', 9, true);