import { query, closePool } from './connect-db.js';

try {
  await query(`
    TRUNCATE TABLE
      order_items,
      feedbacks,
      orders,
      book_authors,
      books,
      authors,
      publishers,
      themes,
      languages,
      customers,
      managers,
      order_statuses
    RESTART IDENTITY CASCADE;
  `);

  console.log('Database cleared');
} finally {
  await closePool();
}
