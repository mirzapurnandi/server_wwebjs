CREATE TABLE public.user_privates (
	user_id text NULL,
	passkey text NULL,
	count int4 DEFAULT 1 NOT NULL,
	method character varying(200) COLLATE pg_catalog."default",
    url text COLLATE pg_catalog."default",
	created_at timestamp NULL,
	updated_at timestamp NULL,
	CONSTRAINT user_privates_pkey PRIMARY KEY (user_id),
	CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(id)
);