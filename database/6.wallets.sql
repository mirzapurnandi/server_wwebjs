-- Table: public.wallets

-- DROP TABLE IF EXISTS public.wallets;

CREATE TABLE IF NOT EXISTS public.wallets
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    point_balance double precision NOT NULL DEFAULT 0,
    status boolean NOT NULL DEFAULT true,
    CONSTRAINT wallets_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.wallets
    OWNER to mirza;