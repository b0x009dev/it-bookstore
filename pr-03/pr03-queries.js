export const queries = [
  {
    title: 'Вывести информацию по всем книгам на русском языке',
    sql: `
      SELECT id, name, year, quantity, price
      FROM books
      WHERE language_id = 2
      ORDER BY id;
    `,
  },
  {
    title: 'Вывести информацию по всем книгам, которых нет в наличии',
    sql: `
      SELECT id, name, quantity
      FROM books
      WHERE quantity = 0
      ORDER BY id;
    `,
  },
  {
    title: 'Вывести информацию по всем покупателям из Москвы',
    sql: `
      SELECT id, name, surname, email, phone, default_address
      FROM customers
      WHERE default_address LIKE 'Москва%'
      ORDER BY id;
    `,
  },
  {
    title: 'Вывести книги с издательствами, годами издания и ценами',
    sql: `
      SELECT b.id, b.name AS book, p.name AS publisher, b.year, b.price
      FROM books b
      JOIN publishers p ON p.id = b.publisher_id
      ORDER BY b.id;
    `,
  },
  {
    title: 'Вывести отзывы с покупателями и оценками',
    sql: `
      SELECT f.id, c.surname || ' ' || c.name AS customer, f.stars, f.content
      FROM feedbacks f
      JOIN customers c ON c.id = f.customer_id
      ORDER BY f.id;
    `,
  },
  {
    title: 'Вывести информацию по всем заказам с их статусами',
    sql: `
      SELECT o.id, o.created_at, s.title_ru AS status, o.delivery_address
      FROM orders o
      JOIN order_statuses s ON s.id = o.order_status_id
      ORDER BY o.id;
    `,
  },
  {
    title: 'Вывести информацию по всем книгам с языком издания',
    sql: `
      SELECT b.id, b.name AS book, l.name AS language
      FROM books b
      JOIN languages l ON l.id = b.language_id
      ORDER BY b.id;
    `,
  },
  {
    title: 'Вывести информацию по всем книгам с их авторами',
    sql: `
      SELECT b.id, b.name AS book, a.surname || ' ' || a.name AS author
      FROM books b
      JOIN book_authors ba ON ba.book_id = b.id
      JOIN authors a ON a.id = ba.author_id
      ORDER BY b.id, a.id;
    `,
  },
  {
    title: 'Вывести книги с их темами и языками издания',
    sql: `
      SELECT b.id, b.name AS book, t.name AS theme, l.name AS language
      FROM books b
      JOIN themes t ON t.id = b.theme_id
      JOIN languages l ON l.id = b.language_id
      ORDER BY b.id;
    `,
  },
  {
    title: 'Вывести заказы с датами, покупателями и менеджерами',
    sql: `
      SELECT o.id AS order_id, o.created_at,
             c.surname || ' ' || c.name AS customer,
             m.surname || ' ' || m.name AS manager
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN managers m ON m.id = o.manager_id
      ORDER BY o.id;
    `,
  },
];
