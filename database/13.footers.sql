-- public.inboxs definition

-- Drop table

-- DROP TABLE public.footers;

CREATE TABLE IF NOT EXISTS public.footers
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    content text COLLATE pg_catalog."default",
    CONSTRAINT footers_pkey PRIMARY KEY (id)
)