-- Table: public.routing_details

-- DROP TABLE IF EXISTS public.routing_details;

CREATE TABLE IF NOT EXISTS public.routing_details
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    routing_id bigint NOT NULL,
    providerdetail_id bigint NOT NULL,
    status boolean NOT NULL DEFAULT true,
    uuid text COLLATE pg_catalog."default" NOT NULL,
    used_at timestamp without time zone,
    is_backup bool DEFAULT false NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT routing_details_pkey PRIMARY KEY (id),
    CONSTRAINT routing_id FOREIGN KEY (routing_id)
        REFERENCES public.routings (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT providerdetail_id FOREIGN KEY (providerdetail_id)
        REFERENCES public.provider_details (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.routing_details
    OWNER to mirza;