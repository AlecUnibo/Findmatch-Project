CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- L'utente che riceve la notifica
    actor_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,      -- L'utente che ha causato la notifica (es. chi ha iniziato a seguirti)
    event_id INTEGER REFERENCES public.events(id) ON DELETE CASCADE,     -- L'evento correlato (opzionale)
    type VARCHAR(50) NOT NULL,                                            -- Tipo di notifica (es. 'nuovo_follower')
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);