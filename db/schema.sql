CREATE TABLE IF NOT EXISTS authors (
	id SERIAL NOT NULL,
	name VARCHAR(100) NOT NULL,
	surname VARCHAR(100) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS publishers (
	id SERIAL NOT NULL,
	name VARCHAR(150) NOT NULL UNIQUE,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS themes (
	id SERIAL NOT NULL,
	name VARCHAR(150) NOT NULL UNIQUE,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS languages (
	id SERIAL NOT NULL,
	name VARCHAR(100) NOT NULL UNIQUE,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS customers (
	id SERIAL NOT NULL,
	name VARCHAR(100) NOT NULL,
	surname VARCHAR(100) NOT NULL,
	login VARCHAR(100) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	phone VARCHAR(16) NOT NULL UNIQUE CHECK(phone ~ '^\+[1-9][0-9]{1,14}$'),
	default_address TEXT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS managers (
	id SERIAL NOT NULL,
	name VARCHAR(100) NOT NULL,
	surname VARCHAR(100) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS order_statuses (
	id SERIAL NOT NULL,
	name VARCHAR(50) NOT NULL UNIQUE,
	title_ru VARCHAR(100) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS books (
	id SERIAL NOT NULL,
	name VARCHAR(255) NOT NULL,
	publisher_id INTEGER NOT NULL,
	theme_id INTEGER NOT NULL,
	language_id INTEGER NOT NULL,
	year INTEGER NOT NULL CHECK(year > 0),
	quantity INTEGER NOT NULL CHECK(quantity >= 0),
	price NUMERIC(10, 2) NOT NULL CHECK(price >= 0),
	PRIMARY KEY(id),
	CONSTRAINT books_publisher_id_fkey
		FOREIGN KEY(publisher_id) REFERENCES publishers(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT books_theme_id_fkey
		FOREIGN KEY(theme_id) REFERENCES themes(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT books_language_id_fkey
		FOREIGN KEY(language_id) REFERENCES languages(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS book_authors (
	book_id INTEGER NOT NULL,
	author_id INTEGER NOT NULL,
	PRIMARY KEY(book_id, author_id),
	CONSTRAINT book_authors_book_id_fkey
		FOREIGN KEY(book_id) REFERENCES books(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT book_authors_author_id_fkey
		FOREIGN KEY(author_id) REFERENCES authors(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS feedbacks (
	id SERIAL NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	book_id INTEGER NOT NULL,
	customer_id INTEGER NOT NULL,
	stars INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
	content TEXT NOT NULL,
	PRIMARY KEY(id),
	CONSTRAINT feedbacks_book_id_customer_id_key UNIQUE (book_id, customer_id),
	CONSTRAINT feedbacks_book_id_fkey
		FOREIGN KEY(book_id) REFERENCES books(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT feedbacks_customer_id_fkey
		FOREIGN KEY(customer_id) REFERENCES customers(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS orders (
	id SERIAL NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	customer_id INTEGER NOT NULL,
	manager_id INTEGER NOT NULL,
	order_status_id INTEGER NOT NULL,
	delivery_address TEXT NOT NULL,
	PRIMARY KEY(id),
	CONSTRAINT orders_customer_id_fkey
		FOREIGN KEY(customer_id) REFERENCES customers(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT orders_manager_id_fkey
		FOREIGN KEY(manager_id) REFERENCES managers(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT orders_order_status_id_fkey
		FOREIGN KEY(order_status_id) REFERENCES order_statuses(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS order_items (
	id SERIAL NOT NULL,
	book_id INTEGER NOT NULL,
	price NUMERIC(10, 2) NOT NULL CHECK(price >= 0),
	quantity INTEGER NOT NULL CHECK(quantity > 0),
	order_id INTEGER NOT NULL,
	PRIMARY KEY(id),
	CONSTRAINT order_items_order_id_book_id_key UNIQUE (order_id, book_id),
	CONSTRAINT order_items_book_id_fkey
		FOREIGN KEY(book_id) REFERENCES books(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT order_items_order_id_fkey
		FOREIGN KEY(order_id) REFERENCES orders(id)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);
