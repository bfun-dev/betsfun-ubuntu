-- Bets.Fun Bets Data Export
-- Generated for migration to new Neon account

-- Insert bets
INSERT INTO bets (id, user_id, market_id, amount, side, price, shares, resolved, payout, created_at, claimed) VALUES
(96, 'web3auth_web3auth_1749470625434', 42, 0.11, false, 0.5000, 0.0880, true, 0.00, '2025-06-12 11:46:45.405989', true),
(97, 'web3auth_web3auth_1749469591636', 42, 0.11, true, 0.5000, 0.0880, true, 0.18, '2025-06-12 11:47:04.886186', true),
(98, 'web3auth_web3auth_1749469591636', 41, 0.10, false, 0.5000, 0.0800, true, 0.00, '2025-06-12 12:27:44.968286', true),
(99, 'web3auth_web3auth_1749470625434', 41, 0.10, true, 0.5000, 0.0800, true, 0.16, '2025-06-12 12:27:46.183524', true);

-- Update sequence for bets
SELECT setval('bets_id_seq', 99, true);