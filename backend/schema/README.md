# Schema Migrations

This folder contains configuration for managing the MolEvolvR database schema
and changes to it, i.e. schema migrations. We're currently using
[Atlas](https://atlasgo.io/), a standalone schema migration tool, to manage our
schema, although this may change if we find that it's too limited.

## Changing the Schema

Atlas follows a model where a schema is defined in a single file, `schema.pg.hcl`,
and migrations are defined in a folder, `migrations/`. The schema file is the
current state of the database schema, and migrations are the changes that need
to be applied to get from one schema to another.

When you change the schema, Atlas will automatically generate a migration file
for you based on the difference between the database and the `schema.pg.hcl`. You
can then run the `apply.sh` script to apply any outstanding migrations to the
database.

After changing `schema.pg.hcl`, run the include script `makemigration.sh
<migration_reason>` to generate a migration. The `migration_reason` argument is
a short description of the changes you made to the schema, and will be used to
name the resulting migration for your reference. The script will generate a new
migration file in the `migrations/` folder and apply it to the database.
