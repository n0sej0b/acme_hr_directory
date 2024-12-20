const express = require('express');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory_db';
const client = new Client(connectionString);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(require('morgan')('dev'));

async function init() {
    // connecting to postgres
    await client.connect();
    await client.query('drop table if exists notes');
    await client.query('drop table if exists categories');
    let SQL = `
        drop table if exists employees;
        drop table if exists departments;
        create table departments(
          id serial primary key,
          name varchar(50) not null
        );
        create table employees(
          id serial primary key,
          name varchar(50) not null,
          created_at timestamp default now(),
          updated_at timestamp default now(),
          department_id integer references departments(id) not null
        );
    `;
    await client.query(SQL);
  console.log(`tables created`);
  SQL = `
      insert into departments(name) values('');
      insert into departments(name) values('');
      insert into departments(name) values('');
      insert into employees(name, department_id) values('', ('));
      insert into employees(name, department_id) values('', ('));
      insert into employees(name, department_id) values('', ('));
    `;
  await client.query(SQL);
  console.log("data seeded");
    

    await client.query(`insert into categories (name) values ('shopping'), ('general'), ('spicy'), ('unpopular')`);
    
    // const { rows } = await client.query('select id, name from categories');
    // turn the array of rows in to an object of key/value pairs

    await client.query(`insert into notes (name, txt, category_id) values
        ('my first note', 'this is a note', (select id from categories where name = 'general')),
        ('my second note', 'this is another one', (select id from categories where name = 'spicy'))`);

    app.listen(port, () => {
        console.log(`app is listening on port: ${port}`);
    })
}

app.get('/api/categories', async (req, res) => {    
    // get all the categories and return them
    const { rows } = await client.query('select id, name from categories;');

    res.json({
        categories: rows
    });
});

app.get('/api/notes', async (req, res) => { 
    try { 
        // get all the notes in decending order by created_at
        const { rows } = await client.query('select notes.id, notes.name, txt, ranking, categories.name as category from notes join categories on notes.category_id = categories.id order by created_at desc');
        res.json({
            notes: rows
        });
    } catch(err) {
        console.log(err);
        next(err)
    }
});

app.post('/api/notes', async (req, res) => {    
    const { name, txt, category } = req.body;
    // create a new note and return it

    const { rows } = await client.query('insert into notes (name, txt, category_id) values ($1, $2, (select id from categories where name = $3)) returning id, name, txt, ranking', [name, txt, category])

    res.json({ ...rows[0], category });
});

app.put('/api/notes/:id', (req, res) => {    
});

app.delete('/api/notes/:id', (req, res) => {    
});

init();