-- public.inboxs definition

-- Drop table

-- DROP TABLE public.inboxs;

CREATE TABLE IF NOT EXISTS public.inboxs
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    messageid text NULL,
    type character varying(100) COLLATE pg_catalog."default",
    license_key text COLLATE pg_catalog."default",
    from_ character varying(200) COLLATE pg_catalog."default",
    to_ character varying(200) COLLATE pg_catalog."default",
    content text COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT inboxs_pkey PRIMARY KEY (id)
)