-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  display_name TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_games_played INTEGER DEFAULT 0,
  total_games_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (wallet_address = current_setting('request.headers', true)::json->>'x-wallet-address');

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

-- Create game_sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('chess', 'tower_defense')),
  quest_id INTEGER,
  stake_amount NUMERIC,
  difficulty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  score INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  game_data JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_sessions
CREATE POLICY "Users can view their own game sessions" 
ON public.game_sessions FOR SELECT USING (true);

CREATE POLICY "Users can create game sessions" 
ON public.game_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own game sessions" 
ON public.game_sessions FOR UPDATE USING (true);

-- Create chess_games table for detailed chess state
CREATE TABLE public.chess_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  fen_position TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  move_history JSONB DEFAULT '[]'::jsonb,
  player_color TEXT NOT NULL DEFAULT 'white' CHECK (player_color IN ('white', 'black')),
  ai_difficulty TEXT NOT NULL,
  is_player_turn BOOLEAN DEFAULT true,
  game_result TEXT CHECK (game_result IN ('win', 'loss', 'draw', null)),
  puzzles_solved INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chess games" 
ON public.chess_games FOR SELECT USING (true);

CREATE POLICY "Users can create chess games" 
ON public.chess_games FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update chess games" 
ON public.chess_games FOR UPDATE USING (true);

-- Create tower_defense_games table
CREATE TABLE public.tower_defense_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  current_wave INTEGER DEFAULT 1,
  current_map TEXT NOT NULL DEFAULT 'forest',
  gold INTEGER DEFAULT 100,
  lives INTEGER DEFAULT 20,
  towers JSONB DEFAULT '[]'::jsonb,
  unlocked_towers JSONB DEFAULT '["basic"]'::jsonb,
  unlocked_maps JSONB DEFAULT '["forest"]'::jsonb,
  game_result TEXT CHECK (game_result IN ('win', 'loss', null)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tower_defense_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tower defense games" 
ON public.tower_defense_games FOR SELECT USING (true);

CREATE POLICY "Users can create tower defense games" 
ON public.tower_defense_games FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tower defense games" 
ON public.tower_defense_games FOR UPDATE USING (true);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view achievements" 
ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Users can create achievements" 
ON public.achievements FOR INSERT WITH CHECK (true);

-- Create daily_challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  game_type TEXT NOT NULL CHECK (game_type IN ('chess', 'tower_defense')),
  challenge_type TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily challenges are viewable by everyone" 
ON public.daily_challenges FOR SELECT USING (true);

-- Create user_challenge_progress table
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, challenge_id)
);

-- Enable RLS
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their challenge progress" 
ON public.user_challenge_progress FOR SELECT USING (true);

CREATE POLICY "Users can create challenge progress" 
ON public.user_challenge_progress FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their challenge progress" 
ON public.user_challenge_progress FOR UPDATE USING (true);

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
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

-- Function to update profile stats after game completion
CREATE OR REPLACE FUNCTION public.update_profile_after_game()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.profiles (wallet_address, total_xp, total_games_played, total_games_won)
    VALUES (
      NEW.wallet_address, 
      NEW.xp_earned, 
      1,
      CASE WHEN NEW.game_data->>'result' = 'win' THEN 1 ELSE 0 END
    )
    ON CONFLICT (wallet_address) DO UPDATE SET
      total_xp = public.profiles.total_xp + NEW.xp_earned,
      total_games_played = public.profiles.total_games_played + 1,
      total_games_won = public.profiles.total_games_won + (CASE WHEN NEW.game_data->>'result' = 'win' THEN 1 ELSE 0 END),
      level = CASE 
        WHEN public.profiles.total_xp + NEW.xp_earned >= 30000 THEN 5
        WHEN public.profiles.total_xp + NEW.xp_earned >= 15000 THEN 4
        WHEN public.profiles.total_xp + NEW.xp_earned >= 5000 THEN 3
        WHEN public.profiles.total_xp + NEW.xp_earned >= 1000 THEN 2
        ELSE 1
      END,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating profile after game
CREATE TRIGGER on_game_session_complete
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_after_game();

-- Insert some sample daily challenges
INSERT INTO public.daily_challenges (game_type, challenge_type, description, target_value, xp_reward) VALUES
('chess', 'wins', 'Win 3 chess games today', 3, 100),
('chess', 'puzzles', 'Solve 5 chess puzzles', 5, 75),
('tower_defense', 'waves', 'Survive 20 waves in Tower Defense', 20, 100),
('tower_defense', 'towers', 'Build 10 towers in a single game', 10, 50);