-- Table: public.providers

-- DROP TABLE IF EXISTS public.providers;

CREATE TABLE IF NOT EXISTS public.providers
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name character varying(200) COLLATE pg_catalog."default",
    code character varying(200) COLLATE pg_catalog."default",
    method character varying(200) COLLATE pg_catalog."default",
    url text COLLATE pg_catalog."default",
    apikey text COLLATE pg_catalog."default",
    pwdkey text COLLATE pg_catalog."default",
    is_ssl boolean DEFAULT false,
    total bigint DEFAULT 10,
    count bigint DEFAULT 0,
    status boolean NOT NULL DEFAULT true,
    description text COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT providers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.providers
    OWNER to mirza;