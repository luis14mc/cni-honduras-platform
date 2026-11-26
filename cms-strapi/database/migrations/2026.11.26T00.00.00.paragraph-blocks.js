'use strict';

const table = 'components_content_paragraphs';
const column = 'text';

async function up(knex) {
  if (!(await knex.schema.hasTable(table))) return;

  if (knex.client.dialect === 'postgresql') {
    const { type } = await knex(table).columnInfo(column);
    if (type === 'jsonb') return;
    await knex.raw(
      `ALTER TABLE ?? ALTER COLUMN ?? TYPE jsonb USING
        CASE WHEN ?? IS NULL THEN NULL
        ELSE jsonb_build_array(jsonb_build_object(
          'type', 'paragraph',
          'children', jsonb_build_array(jsonb_build_object('type', 'text', 'text', ??))
        )) END`,
      [table, column, column, column]
    );
    return;
  }

  // SQLite stores JSON as text. On MySQL the schema sync can cast these valid JSON strings.
  const batchSize = 200;
  let lastId = 0;
  while (true) {
    const rows = await knex(table).select('id', column).where('id', '>', lastId).orderBy('id').limit(batchSize);
    if (rows.length === 0) break;
    for (const row of rows) {
      if (row.text === null) continue;
      const blocks = [{ type: 'paragraph', children: [{ type: 'text', text: row.text }] }];
      await knex(table).where('id', row.id).update({ [column]: JSON.stringify(blocks) });
    }
    lastId = rows.at(-1).id;
  }
}

module.exports = { up };
