
CREATE TABLE IF NOT EXISTS players (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game VARCHAR(40) NOT NULL DEFAULT 'valorant',
    game_player_id VARCHAR(120),
    player_name VARCHAR(80) NOT NULL,
    tagline VARCHAR(30),
    region VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT players_game_identity_unique
        UNIQUE (game, game_player_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game VARCHAR(40) NOT NULL DEFAULT 'valorant',
    provider_match_id VARCHAR(150),
    player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    map_name VARCHAR(80),
    result VARCHAR(10),
    kills INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
    deaths INTEGER NOT NULL DEFAULT 0 CHECK (deaths >= 0),
    assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
    played_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS matches_provider_identity_unique
    ON matches (game, provider_match_id, player_id)
    WHERE provider_match_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS matches_player_played_at_idx
    ON matches (player_id, played_at DESC);
