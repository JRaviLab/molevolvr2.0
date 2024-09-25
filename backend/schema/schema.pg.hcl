# the default schema
schema "public" {}

enum "status" {
  schema = schema.public
  values = ["submitted", "analyzing", "complete", "error"]
}

table "analyses" {
  schema = schema.public
  column "id" {
    # null = false
    type = varchar
    default = sql("right(uuid_generate_v4()::varchar, 6)")
  }
  column "name" {
    type = varchar
  }
  column "type" {
    type = varchar
  }
  column "info" {
    null = true
    // you'll need to use jsonlite::toJSON(force=TRUE) to render json as strings
    type = json
  }
  column "created" {
    null = false
    type = timestamptz
    default = sql("now()")
  }
  column "started" {
    null = true
    type = timestamptz
  }
  column "completed" {
    null = true
    type = timestamptz
  }
  column "status" {
    // same as json, need force=TRUE to render enums as strings
    type = enum.status
    null = false
    default = "submitted"
  }
  column "reason" {
    null = true
    type = text
  }

  primary_key {
    columns = [
      column.id
    ]
  }
}

table "users" {
  schema = schema.public
  column "id" {
    null = false
    type = bigserial
  }
  column "name" {
    type = varchar
  }
  column "created" {
    null = false
    type = timestamptz
    default = sql("now()")
  }
}

table "analysis_event" {
  schema = schema.public
  column "id" {
    null = false
    type = bigserial
  }
  column "analysis_id" {
    null = false
    type = varchar
  }
  column "event" {
    null = false
    type = varchar
  }
  column "info" {
    null = true
    type = text
  }
  column "created" {
    null = false
    type = timestamptz
    default = sql("now()")
  }

  primary_key {
    columns = [
      column.id
    ]
  }

  foreign_key "analysis_fk" {
    columns = [column.analysis_id]
    ref_columns = [table.analyses.column.id]
  }
}
