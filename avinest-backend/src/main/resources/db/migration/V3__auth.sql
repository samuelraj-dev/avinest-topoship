CREATE TABLE devices (
     device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,

     user_agent TEXT NOT NULL,
     ip_address TEXT NOT NULL,
     device_name TEXT,

     first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     last_seen  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

     UNIQUE (user_id, user_agent, ip_address)
);

CREATE INDEX idx_devices_user_id ON devices(user_id);

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id   BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    device_id UUID   NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,

    access_token_hash  CHAR(64) NOT NULL,
    refresh_token_hash CHAR(64) NOT NULL,

    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_access_at TIMESTAMP,
    expires_at     TIMESTAMP NOT NULL,

    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at  TIMESTAMP,
    revoke_reason TEXT,

    CONSTRAINT chk_revoked CHECK (
        (revoked = FALSE AND revoked_at IS NULL) OR
        (revoked = TRUE AND revoked_at IS NOT NULL)
    )
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_device_id ON sessions(device_id);

CREATE UNIQUE INDEX idx_sessions_access_token_hash
    ON sessions(access_token_hash);

CREATE UNIQUE INDEX idx_sessions_refresh_token_hash
    ON sessions(refresh_token_hash);

CREATE INDEX idx_sessions_user_active
    ON sessions(user_id)
    WHERE revoked = FALSE;


ALTER TABLE app_users
    ADD COLUMN password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


CREATE TABLE login_audit (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_users(id),

    username TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,

    success BOOLEAN NOT NULL,
    failure_reason TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_audit_user_id ON login_audit(user_id);
CREATE INDEX idx_login_audit_created_at ON login_audit(created_at);

COMMENT ON COLUMN sessions.expires_at IS 'Session hard expiry (not JWT expiry)';
COMMENT ON COLUMN sessions.access_token_hash IS 'SHA-256 hash of access JWT';
COMMENT ON COLUMN sessions.refresh_token_hash IS 'SHA-256 hash of refresh token';
