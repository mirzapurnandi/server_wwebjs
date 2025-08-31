-- Table: public.routings

-- DROP TABLE IF EXISTS public.routings;

CREATE TABLE IF NOT EXISTS public.routings
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    sender_name character varying(255) COLLATE pg_catalog."default",
    user_id text COLLATE pg_catalog."default",
    count int DEFAULT 0 NULL,
    backup int DEFAULT 0 NULL,
    delay int DEFAULT 6 NOT NULL,
    status boolean NOT NULL DEFAULT true,
    type character varying COLLATE pg_catalog."default",
    delay int4 DEFAULT 6 NOT NULL,
	price float8 DEFAULT 0 NOT NULL,
	price_per_message float8 DEFAULT 0 NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT routings_pkey PRIMARY KEY (id),
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.routings
    OWNER to mirza;