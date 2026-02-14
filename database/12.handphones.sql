-- Table: public.handphones

-- DROP TABLE IF EXISTS public.handphones;

CREATE TABLE IF NOT EXISTS public.handphones
(
    id text COLLATE pg_catalog."default" NOT NULL,
    handphonemerk_id bigint NULL,
    name character varying(255) COLLATE pg_catalog."default",
    type character varying COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    is_active bool DEFAULT true NOT NULL,
    is_recovery bool DEFAULT false NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    urutan int NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT handphones_pkey PRIMARY KEY (id),
    CONSTRAINT handphonemerk_id FOREIGN KEY (handphonemerk_id)
        REFERENCES public.handphone_merks (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.handphones
    OWNER to mirza;