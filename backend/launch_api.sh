#!/bin/bash

# run schema migrations via ./schema/apply.sh
(
    echo "* Running schema migrations, if any are available..."
    cd schema
    ./apply.sh
)

# pass off to drip to control serving and reloading the API
drip
