-- Table: public.transactions

-- DROP TABLE IF EXISTS public.transactions;

CREATE TABLE IF NOT EXISTS public.transactions
(
    id_transaction text COLLATE pg_catalog."default" NOT NULL,
    routingdetail_id bigint NULL,
    user_id text COLLATE pg_catalog."default",
    sender_name character varying(255) COLLATE pg_catalog."default",
    access character varying COLLATE pg_catalog."default",
    destination text COLLATE pg_catalog."default",
    content text COLLATE pg_catalog."default",
    image text COLLATE pg_catalog."default",
    price double precision,
    status_code character varying(200) COLLATE pg_catalog."default",
    messageid text COLLATE pg_catalog."default",
    message_status character varying(200) COLLATE pg_catalog."default",
    optional_id text NULL,
    time_send timestamp without time zone,
    time_receive timestamp without time zone,
    time_read timestamp without time zone,
    CONSTRAINT transactions_pkey PRIMARY KEY (id_transaction),
    CONSTRAINT routingdetail_id FOREIGN KEY (routingdetail_id)
        REFERENCES public.routing_details (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.transactions
    OWNER to mirza;