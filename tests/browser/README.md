# Regressió interactiva del cercador

`home-search.mjs` aixeca Vite temporalment a 127.0.0.1:5188, carrega només la fixture sintètica i executa Chromium d’escriptori i mòbil tàctil emulat. Bloqueja peticions externes i comprova que no n’hi ha cap. No autentica ni consulta Supabase.

Requereix Playwright i Chromium disponibles fora del projecte; no cal afegir-los a package.json. Per exemple:

```sh
npm install --prefix /tmp/tsumige-browser-tests --no-save --package-lock=false playwright
node /tmp/tsumige-browser-tests/node_modules/playwright/cli.js install chromium
node tests/browser/home-search.mjs
```

Si la llibreria està en una altra ruta, indica-la amb `TSUMIGE_PLAYWRIGHT_MODULE` (fitxer `playwright/index.mjs`). Chromium necessita les seves biblioteques del sistema. En la comprovació local es van extreure només a `/tmp/tsumige-browser-tests/libs` els paquets de biblioteques absents, sense instal·lar-los al sistema:

```sh
LD_LIBRARY_PATH=/tmp/tsumige-browser-tests/libs/usr/lib/x86_64-linux-gnu node tests/browser/home-search.mjs
```

La fixture reprodueix el `main` enfocable del layout real. Sense la correcció del pointerdown, el blur desmunta els suggeriments abans del click i falla l’obertura. Es comproven selecció per clic/tap/Retorn, plataforma, retorn de focus, Esc, Tab, clic fora i detalls amb zero/un/diversos vincles. Les proves no substitueixen dispositius físics ni les comprovacions manuals reals ajornades. No s’inclouen en el workflow existent perquè no s’hi ha afegit cap dependència de navegador.

`node tests/browser/detail-appearance.mjs` reutilitza la mateixa preparació de Playwright i, si cal, LD_LIBRARY_PATH. Comprova el detall amb imatges generades sintètiques (vertical/panoràmica/error/absent), distintius de valoració, contingut llarg i filtres de Revisió de dades en 1440×900 i 390×844, Clar/Fosc. Desa només captures sintètiques a /tmp. No utilitza imatges ni registres reals i bloqueja serveis externs.

Les regressions `game-labels.mjs` i `catalog-filters.mjs` requereixen Vite local
actiu a `http://127.0.0.1:5173/Tsumige/` i la mateixa preparació de Playwright.
Utilitzen exclusivament fixtures sintètiques i bloquegen peticions externes:

```sh
node tests/browser/game-labels.mjs
node tests/browser/catalog-filters.mjs
```

Comproven caselles d’alta/edició, exclusivitat, consulta convidada i filtres/URL,
retorn del detall, recàrrega i amplades mòbil/tauleta/escriptori amb Clar/Fosc.
No desen registres ni executen SQL. Les captures de prova queden a /tmp, fora
del repositori; no substitueixen les comprovacions manuals reals pendents.
