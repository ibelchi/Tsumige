# Formularis d’alta

## Estat i dependència

Criteris aprovats i implementats. La tanda conjunta de RPC d’altes i noms de plataforma s’ha aplicat una vegada per l’usuari i el rebut post-COMMIT s’ha validat: `verificat=true`, cap diferència imprevista i definicions/permisos contrastats. No tornar a executar les migracions ni fer un push global de SQL. El client comprova `versio_altes()` i desactiva el desament si la RPC no està disponible.

Les proves manuals d’altes noves continuen pendents perquè l’usuari no té registres reals per incorporar. S’han de recordar abans de publicar, sense donar-les per superades ni bloquejar la publicació només per aquest motiu. Les proves locals d’atomicitat, duplicats i permisos són sintètiques. Auth/Storage API i concurrència multiclient real no es donen per verificats.

La migració incorpora únicament `versio_altes` i `alta_registre`, amb permisos del propietari i RLS vigents. No crea índexs únics, no consolida registres antics ni modifica taules, Auth, assignacions de convidats o Storage. El diagnòstic conjunt real ja es va contrastar; els SQL d’inspecció es conserven com a referència, sense necessitat de repetir-los per publicar el client.

## Col·lecció: recorregut aprovat

1. «Afegeix un joc» obre directament Nom i Plataforma amb suggeriments distingits per plataforma i ID. Una selecció explícita vincula el joc existent; un text nou crea una fitxa diferent. Coincidències de títol/plataforma bloquegen un duplicat i ofereixen seleccionar/obrir el registre existent; mai es vincula automàticament pel nom.
2. El formulari inclou portada/font, desenvolupadora, gèneres, sinopsi, any de llançament, valoració, comentaris, Per jugar aviat i Per jugar amb infants; i format, regió, conservació, compra, Favorit, intercanvi, reproducció i No localitzat. Els camps opcionals buits es conserven com a buits; 0 € és conegut. Plataformes noves s’escriuen lliurement; Emulador no es permet.
3. Les dades d’un joc seleccionat es mostren de lectura, amb «Edita les dades del joc» explícit. No es canvia la seva identitat ni plataforma. Una plataforma diferent requereix un altre joc.
4. Si ja hi ha un exemplar actiu, es pot obrir. El físic preval: no s’afegeix un digital sobre un físic ni una segona còpia del mateix format. Afegir físic quan només hi ha un digital exigeix revisar la seva compra/regió/conservació/notes i confirmar que queda històric inactiu. No s’eliminen dades ni entrades; els IDs anteriors es conserven. Diversos actius no es consoliden automàticament.
5. Una transacció desa fitxa/exemplar i, si s’ha confirmat, retira el digital del recompte actiu. **Mai crea entrades de log ni executa el circuit Jugant.** Després obre el detall de l’exemplar en consulta.

Exemple sintètic: Prova · Nintendo Switch, físic, compra 2026 i 0 €: fitxa i exemplar, cap entrada. Prova · Steam és una altra fitxa. Si Switch ja té digital, les compres continuen separades i el digital queda històric només amb confirmació.

## log: recorregut aprovat

1. «Afegeix una entrada» obre un únic camp Nom per escriure i cercar. No hi ha modalitats prèvies. Els suggeriments mostren plataforma i ID; seleccionar Steam no vincula Epic Games.
2. Joc existent: portada, metadades, valoració i comentaris de lectura. «Edita les dades del joc» activa els controls amb un avís breu: els canvis afecten el joc i totes les seves entrades. Sense aquesta acció la RPC ignora el payload compartit i conserva els valors desats.
3. Joc nou: Nom/Plataforma obligatoris, altres dades opcionals. Es crea la fitxa i l’entrada atòmicament, sense exemplar. Emulador és permès; no es dedueixen botigues ni s’incorpora el joc a Col·lecció.
4. Any obligatori, amb l’any actual preseleccionat; Completat pertany a l’entrada. Una entrada per joc/any: si existeix s’ofereix obrir-la. Si hi ha diversos duplicats antics, es mostren per seleccionar-ne un; no s’eliminen. Les entrades sense any es preserven.
5. Jugant opera sobre el conjunt del joc: activar-lo deixa el joc jugant; desactivar-lo desmarca les entrades jugant del mateix joc. La interfície ho explica. Valoració/comentaris són del joc; el trigger vigent sincronitza la valoració de les entrades.
6. Desar obre en consulta el detall de l’entrada creada, mantenint els filtres de la llista. Exemples: Prova · Steam 2026 i 2027 comparteixen fitxa/valoració/comentaris; Prova · Epic Games té una altra fitxa; Emulat · Emulador 2026 no té cap exemplar.

## Errors, atomicitat i permisos

Una única RPC executa les operacions relacionades amb bloqueig transaccional per propietari i files relacionades. Errors de dades, permisos o versions desactualitzades no apliquen canvis parcials. El client conserva l’esborrany i permet corregir errors definitius; davant resposta incerta bloqueja l’edició i repeteix el mateix UUID/payload, sense duplicar ni tornar a modificar el joc. Un desament confirmat amb error de recàrrega només reintenta carregar el detall. Tanca/Esc/canvi de joc avisen dels canvis pendents; sortir de la pàgina també es protegeix. Els convidats no veuen els formularis i la RPC rebutja escriptures.

La serialització evita duplicats entre peticions d’aquesta nova RPC. Les escriptures directes o clients antics no comparteixen aquest bloqueig: abans d’habilitar el flux cal desplegar el client nou i revisar els duplicats amb el diagnòstic. No s’afegeixen restriccions globals incompatibles amb dades històriques.

## Verificació i revisió pendent

Proves sintètiques en PostgreSQL local reconstruït amb les metadades contrastades: plataformes diferents/noves, Emulador, 0/buit, duplicats, anys absents antics, dades compartides, Jugant global, confirmació física/digital, reintents, rollback i permisos propietari/convidat/anònim. Auth/Storage són els auxiliars locals de les proves; no s’ha comprovat el servei real ni s’han modificat dades.

Revisió al navegador pendent: escriptori/mòbil, suggeriments i teclat, protecció de l’esborrany, canvi de joc, consulta/edició explícita, errors i retorn al detall. La dependència RPC ja està resolta; l’alta remota manual encara no s’ha provat. Favorit fora de Col·lecció continua sent una discrepància de model anterior: és d’exemplar i no s’afegeix un camp nou.

### Controls reproduïbles

- `npm run typecheck`, `npm run lint`, `npm run build`.
- Helpers/regressions: `node_modules/.bin/esbuild tests/*.test.ts --outdir=/tmp/tsumige-altes-tests --bundle --platform=node --format=esm`, després `node --test /tmp/tsumige-altes-tests/*.js`.
- Consulta inicial sintètica (renderitzat HTML, sense navegador): `node_modules/.bin/esbuild tests/record-creation-view.test.tsx --outfile=/tmp/tsumige-altes-view.cjs --bundle --platform=node --format=cjs '--define:import.meta.env={}'`, després `node --test /tmp/tsumige-altes-view.cjs`. Comprova absència de modalitats prèvies, camps de Col·lecció sense log, any actual obligatori, dades compartides de lectura i convidats sense formulari. No verifica disposició visual ni interaccions.
- RPC: `node supabase/tests/local/creation.mjs /ruta/privada/esquema-recuperacio.json`. Requereix PGlite instal·lat fora del repositori (ruta configurable amb `TSUMIGE_PGLITE_MODULE`); només usa metadades i dades sintètiques. Passat amb les metadades privades contrastades, sense copiar-les al repositori.

Resultat local: tots els controls anteriors superats. Compilació amb l’avís ja existent de paquet superior a 500 kB. Queden pendents les interaccions i la presentació visual en escriptori/mòbil, les altes manuals noves; el diagnòstic real i l’aplicació de les RPC ja s’han validat. Les proves locals no validen la concurrència de clients antics ni el transport real Auth/PostgREST.

## Historial de preparació del 2026-10-13

Les notes següents descriuen la preparació prèvia i queden substituïdes per l’estat aplicat de la capçalera. No són instruccions per tornar a aplicar SQL.

Criteris aprovats i proves locals d’atomicitat/permisos repetits i superats. La dependència de `alta_registre` continua pendent d’aplicar; no s’ha escrit a Supabase. El nou nom canònic Game Boy del client requereix també la normalització SQL preparada per garantir la mateixa prevenció de duplicats en servidor quan hi ha fitxes antigues GB. Vegeu [NOMS-PLATAFORMES.md](NOMS-PLATAFORMES.md).

## Tanda conjunta del 2026-10-13

La RPC d’alta s’aplicarà conjuntament amb els noms aprovats, mitjançant un únic bundle privat transaccional. No executar els fitxers separats: procediment, captura agrupada i recuperació a [NOMS-PLATAFORMES.md](NOMS-PLATAFORMES.md). Les proves d’alta s’han repetit amb la normalització conjunta. La confirmació visual de l’usuari no dona per comprovat el desament remot, encara pendent de RPC.
