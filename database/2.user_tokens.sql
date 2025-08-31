-- Table: public.user_tokens

-- DROP TABLE IF EXISTS public.user_tokens;

CREATE TABLE IF NOT EXISTS public.user_tokens
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    user_id text COLLATE pg_catalog."default",
    token text COLLATE pg_catalog."default",
    refresh_token text COLLATE pg_catalog."default",
    logout boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT user_tokens_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_tokens
    OWNER to mirza;