CREATE TABLE IF NOT EXISTS public.handphone_settings
(
    id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
    no_hp character varying(20) NOT NULL,
    type character varying(50) NOT NULL, -- 'sapa_local' atau 'sapa_warga'
    is_active bool DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    CONSTRAINT handphone_settings_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.handphone_settings OWNER to mirza;