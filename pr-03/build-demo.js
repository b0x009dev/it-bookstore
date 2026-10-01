import { mkdir, writeFile } from 'node:fs/promises';
import { query, closePool } from '../db/connect-db.js';
import { queries } from './pr03-queries.js';

const tables = [
  'authors',
  'publishers',
  'themes',
  'languages',
  'customers',
  'managers',
  'order_statuses',
  'books',
  'book_authors',
  'feedbacks',
  'orders',
  'order_items',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatValue(value) {
  if (value instanceof Date) {
    return value.toLocaleString('ru-RU');
  }

  return value;
}

function renderTable(rows) {
  if (rows.length === 0) {
    return '<p>Нет данных</p>';
  }

  const columns = Object.keys(rows[0]);
  const head = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('');
  const body = rows
    .map((row) => {
      const cells = columns
        .map((column) => `<td>${escapeHtml(formatValue(row[column]))}</td>`)
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderPage(title, content) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2937; background: #f3f4f6; }
    header { padding: 24px 32px; background: #ffffff; border-bottom: 1px solid #d1d5db; }
    main { padding: 24px 32px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    h2 { margin: 0 0 16px; font-size: 22px; }
    h3 { margin: 0 0 12px; font-size: 18px; }
    a { color: #1d4ed8; }
    section { margin: 0 0 28px; padding: 20px; background: #ffffff; border: 1px solid #d1d5db; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; background: #ffffff; }
    th, td { padding: 8px 10px; border: 1px solid #d1d5db; text-align: left; vertical-align: top; }
    th { background: #e5e7eb; }
    pre { margin: 0 0 16px; padding: 12px; overflow: auto; background: #111827; color: #f9fafb; font-size: 13px; }
    .nav { display: flex; gap: 16px; margin-top: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <div class="nav">
      <a href="tables.html">Все таблицы</a>
      <a href="queries.html">10 запросов</a>
    </div>
  </header>
  <main>
    ${content}
  </main>
</body>
</html>
`;
}

async function buildTablesPage() {
  const sections = [];

  for (const table of tables) {
    const result = await query(`SELECT * FROM ${table} ORDER BY 1`);
    sections.push(`
      <section>
        <h2>${escapeHtml(table)}</h2>
        ${renderTable(result.rows)}
      </section>
    `);
  }

  return renderPage('Задание 1. Таблицы базы данных', sections.join(''));
}

async function buildQueriesPage() {
  const sections = [];

  for (const [index, item] of queries.entries()) {
    const result = await query(item.sql);
    sections.push(`
      <section>
        <h2>Запрос ${index + 1}</h2>
        <h3>${escapeHtml(item.title)}</h3>
        <pre>${escapeHtml(item.sql.trim())}</pre>
        ${renderTable(result.rows)}
      </section>
    `);
  }

  return renderPage('Задание 2 и 4. SQL-запросы и результаты', sections.join(''));
}

try {
  await mkdir('pr-03/demo', { recursive: true });
  await writeFile('pr-03/demo/tables.html', await buildTablesPage(), 'utf8');
  await writeFile('pr-03/demo/queries.html', await buildQueriesPage(), 'utf8');
  console.log('Demo pages created');
} finally {
  await closePool();
}
