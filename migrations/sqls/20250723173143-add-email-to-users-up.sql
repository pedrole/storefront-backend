-- First add the column without UNIQUE constraint and without NOT NULL
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Update existing users with unique placeholder emails using their ID
UPDATE users SET email = first_name || '.' || last_name || '.' || id || '@example.com' WHERE email IS NULL;

-- Now add the UNIQUE constraint after ensuring all emails are unique
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Make the column NOT NULL
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
