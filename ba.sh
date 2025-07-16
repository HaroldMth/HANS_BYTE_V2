#!/bin/bash

echo "[*] Scanning JavaScript files for imports (excluding node_modules)..."

pkgs=$(grep -rEho --exclude-dir=node_modules \
  "require\(['\"]([^'\"]+)['\"]\)|import\s+.*from\s+['\"]([^'\"]+)['\"]" . \
  | sed -E "s/.*require\(['\"]//;s/['\"]\).*//;s/.*from\s+['\"]//;s/['\"]//" \
  | grep -vE '^\s*$' \
  | grep -vE '^(\.|\/)' \
  | grep -vE '^(node:|fs|path|os|http|https|crypto|stream|util|events|zlib|tty|cluster|dns|dgram|child_process|timers|net|readline|module|repl|url|vm|assert|buffer|querystring|string_decoder|punycode|constants|process|v8|perf_hooks|inspector|worker_threads)$' \
  | grep -vE '[/\\]|[^a-zA-Z0-9@._-]' \
  | sort -u
)

echo "[*] Packages to install:"
echo "$pkgs"

for pkg in $pkgs; do
  if [[ "$pkg" != "" ]]; then
    echo "[+] Installing: $pkg"
    npm install "$pkg"
  fi
done

echo "[✔] Done."
