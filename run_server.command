echo '#!/bin/bash
cd "$(dirname "$0")"
python3 -m http.server 8000 &
sleep 1
open http://localhost:8000/index.html' > run_server.command