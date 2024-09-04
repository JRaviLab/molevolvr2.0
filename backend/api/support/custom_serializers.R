#' Custom JSON serialization functions
#' Implements handlers for types returned by DBI/Rpostgres that can't
#' be serialized by jsonlite by default

box::use(
  plumber[register_serializer, serializer_content_type],
  api/support/string_helpers[inline_str_list]
)

#' Register custom serializers, e.g. for JSON with specific defaults
setup_custom_serializers <- function() {
  # ------------------------------------------------------
  # --- jsonExt: json + default options
  # ------------------------------------------------------
  
  # Register a custom serializer, 'jsonExt', for JSON that supplies a lot of the defaults
  # that we'd otherwise be supplying to every endpoint in the API.
  register_serializer(
    "jsonExt",
    function (
      verbose_checks=FALSE,
      force = TRUE,
      simplifyVector = TRUE,
      auto_unbox = TRUE,
      na = "null",
      pretty = TRUE,
      ..., type = "application/json"
    )  {
      serializer_content_type(type, function(val) {
        # convert other args to list, if specified
        other_args <- list(...)

        # show additional args passed on to toJSON if verbose_checks is TRUE
        if (verbose_checks && length(other_args) > 0) {
          message(paste("jsonForceExt extra toJSON opts: ", inline_str_list(other_args)))
        }

        # wrap toJSON so we can use it both in the verbose and non-verbose cases
        encodeJSON <- function(val) {
          jsonlite::toJSON(
            val,
            force = force, simplifyVector = simplifyVector, auto_unbox = auto_unbox, na = na, pretty = pretty,
            ...
          )
        }

        # if verbose_checks is TRUE, wrap the toJSON call in a tryCatch block.
        # this shows serialization errors early, instead of causing plumber to
        # throw a cryptic message about [index='status'] not being available,
        # presumably because the response object is malformed and '$status' is
        # thus not available on it.
        if (verbose_checks) {
          result <- tryCatch(
            { encodeJSON(val) },
            error = function(e) {
              # FIXME: perhaps we should just stop() rather than displaying a message?
              message(toString(e))
              return(NULL)
            }
          )
        }
        else {
          result <- encodeJSON(val)
        }

        return(result)
      })
    }
  )

  # ------------------------------------------------------
  # --- define any extra custom serializers below
  # ------------------------------------------------------
}
