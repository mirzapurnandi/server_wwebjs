-- Table: public.wallet_details

-- DROP TABLE IF EXISTS public.wallet_details;

CREATE TABLE IF NOT EXISTS public.wallet_details
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    wallet_id bigint NOT NULL,
    point double precision,
    info text COLLATE pg_catalog."default",
    wallettype text COLLATE pg_catalog."default",
    uuid text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT wallet_details_pkey PRIMARY KEY (id),
    CONSTRAINT wallet_id FOREIGN KEY (wallet_id)
        REFERENCES public.wallets (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.wallet_details
    OWNER to mirza;