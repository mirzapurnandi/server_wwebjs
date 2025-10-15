-- Table: public.handphone_merks

-- DROP TABLE IF EXISTS public.handphone_merks;

CREATE TABLE IF NOT EXISTS public.handphone_merks
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name character varying(255) COLLATE pg_catalog."default",
    info character varying(255) COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    CONSTRAINT handpohone_merks_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.handphone_merks
    OWNER to mirza;