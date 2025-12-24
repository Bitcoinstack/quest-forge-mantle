-- Fix the security definer view issue by dropping and recreating as a regular view
DROP VIEW IF EXISTS public.leaderboard;

-- Recreate as regular view (not security definer)
CREATE VIEW public.leaderboard AS
SELECT 
  wallet_address,
  COALESCE(display_name, LEFT(wallet_address, 6) || '...' || RIGHT(wallet_address, 4)) as display_name,
  total_xp,
  level,
  total_games_played,
  total_games_won
FROM public.profiles
ORDER BY total_xp DESC
LIMIT 100;