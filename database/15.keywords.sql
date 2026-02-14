CREATE TABLE IF NOT EXISTS public.keywords
(
    id serial NOT NULL,
    no_hp character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    note text,
    parent_id int NULL,
    message_reply text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    CONSTRAINT keywords_pkey PRIMARY KEY (id),
    CONSTRAINT fk_parent_keyword FOREIGN KEY (parent_id)
        REFERENCES public.keywords (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.keywords OWNER to mirza;

-- Index untuk mempercepat pencarian chatbot
CREATE INDEX IF NOT EXISTS idx_keywords_lookup ON public.keywords (no_hp, name);