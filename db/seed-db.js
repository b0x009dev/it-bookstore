import { readFile } from 'node:fs/promises';
import { query, closePool } from './connect-db.js';

const ids = {
  authors: new Map(),
  publishers: new Map(),
  themes: new Map(),
  languages: new Map(),
  customers: new Map(),
  managers: new Map(),
  order_statuses: new Map(),
  books: new Map(),
  orders: new Map(),
};

function parseCsv(text) {
  const [header, ...lines] = text.trim().split('\n');
  const columns = header.split(',');

  return lines.map((line) => {
    const values = line.split(',');

    return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
  });
}

async function readRows(table) {
  const csv = await readFile(`db/csv/${table}.csv`, 'utf8');

  return parseCsv(csv);
}

function saveId(table, code, id) {
  if (ids[table].has(code)) {
    throw new Error(`${table}: duplicate code ${code}`);
  }

  ids[table].set(code, id);
}

function getId(table, code) {
  const id = ids[table].get(code);

  if (!id) {
    throw new Error(`${table}: unknown code ${code}`);
  }

  return id;
}

async function insertRow(table, row, returningId = false) {
  const columns = Object.keys(row);
  const columnNames = columns.join(', ');
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const values = columns.map((column) => row[column]);
  const returning = returningId ? ' RETURNING id' : '';
  const result = await query(
    `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})${returning}`,
    values,
  );

  return result.rows[0]?.id;
}

async function seedCodedTable(table) {
  const rows = await readRows(table);

  for (const row of rows) {
    const { code, ...data } = row;
    const id = await insertRow(table, data, true);

    saveId(table, code, id);
  }

  console.log(`${table}: ${rows.length}`);
}

async function seedBooks() {
  const rows = await readRows('books');

  for (const row of rows) {
    const id = await insertRow(
      'books',
      {
        name: row.name,
        publisher_id: getId('publishers', row.publisher_code),
        theme_id: getId('themes', row.theme_code),
        language_id: getId('languages', row.language_code),
        year: row.year,
        quantity: row.quantity,
        price: row.price,
      },
      true,
    );

    saveId('books', row.code, id);
  }

  console.log(`books: ${rows.length}`);
}

async function seedBookAuthors() {
  const rows = await readRows('book_authors');

  for (const row of rows) {
    await insertRow('book_authors', {
      book_id: getId('books', row.book_code),
      author_id: getId('authors', row.author_code),
    });
  }

  console.log(`book_authors: ${rows.length}`);
}

async function seedFeedbacks() {
  const rows = await readRows('feedbacks');

  for (const row of rows) {
    await insertRow('feedbacks', {
      created_at: row.created_at,
      book_id: getId('books', row.book_code),
      customer_id: getId('customers', row.customer_code),
      stars: row.stars,
      content: row.content,
    });
  }

  console.log(`feedbacks: ${rows.length}`);
}

async function seedOrders() {
  const rows = await readRows('orders');

  for (const row of rows) {
    const id = await insertRow(
      'orders',
      {
        created_at: row.created_at,
        customer_id: getId('customers', row.customer_code),
        manager_id: getId('managers', row.manager_code),
        order_status_id: getId('order_statuses', row.order_status_code),
        delivery_address: row.delivery_address,
      },
      true,
    );

    saveId('orders', row.code, id);
  }

  console.log(`orders: ${rows.length}`);
}

async function seedOrderItems() {
  const rows = await readRows('order_items');

  for (const row of rows) {
    await insertRow('order_items', {
      book_id: getId('books', row.book_code),
      price: row.price,
      quantity: row.quantity,
      order_id: getId('orders', row.order_code),
    });
  }

  console.log(`order_items: ${rows.length}`);
}

try {
  await seedCodedTable('authors');
  await seedCodedTable('publishers');
  await seedCodedTable('themes');
  await seedCodedTable('languages');
  await seedCodedTable('customers');
  await seedCodedTable('managers');
  await seedCodedTable('order_statuses');
  await seedBooks();
  await seedBookAuthors();
  await seedFeedbacks();
  await seedOrders();
  await seedOrderItems();
} finally {
  await closePool();
}
