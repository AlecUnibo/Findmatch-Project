CREATE TABLE IF NOT EXISTS followers (
  user_id     INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- chi viene seguito
  follower_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- chi segue
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, follower_id)
);

-- utile per vedere chi seguo --
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
