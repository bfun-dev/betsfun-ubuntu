-- Bets.Fun User Badges Data Export
-- Generated for migration to new Neon account

-- Insert user badges
INSERT INTO user_badges (id, user_id, badge_id, earned_at, progress) VALUES
(8, '1749458551169', 8, '2025-06-09 09:07:26.2238', 0.00),
(9, '1749458551169', 7, '2025-06-09 09:07:33.66172', 0.00),
(10, '1749458551169', 2, '2025-06-09 09:07:47.443063', 0.00),
(11, '1749458551169', 3, '2025-06-09 09:07:48.519465', 0.00),
(12, '1749458551169', 4, '2025-06-09 09:07:49.466996', 0.00),
(13, '1749458551169', 9, '2025-06-09 09:07:50.500532', 0.00),
(14, '1749458551169', 6, '2025-06-09 09:07:52.840078', 0.00);

-- Update sequence for user_badges
SELECT setval('user_badges_id_seq', 14, true);