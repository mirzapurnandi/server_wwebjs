-- Table: public.provider_details

-- DROP TABLE IF EXISTS public.provider_details;

CREATE TABLE IF NOT EXISTS public.provider_details
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    provider_id bigint NOT NULL,
    user_id text COLLATE pg_catalog."default" NOT NULL,
    license_key text COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT true,
    label character varying(255) COLLATE pg_catalog."default",
    price double precision DEFAULT 0,
    uuid text COLLATE pg_catalog."default" NOT NULL,
    description text NULL,
    expired_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT provider_details_pkey PRIMARY KEY (id),
    CONSTRAINT provider_id FOREIGN KEY (provider_id)
        REFERENCES public.providers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.provider_details
    OWNER to mirza;