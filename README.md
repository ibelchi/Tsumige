# 積みゲー · Tsumigē

**Una col·lecció de videojocs i un log personal, en un mateix lloc.**

Tsumigē neix per consultar una col·lecció física i digital. També permet recordar què s’ha jugat al llarg dels anys, valorar els jocs, escriure comentaris i seguir els propòsits de cada any. La interfície és en català i busca una presentació clara, discreta i fàcil de consultar.

[Obre l’aplicació](https://ibelchi.github.io/Tsumige/) · [Blog de l’autor](https://ibelchi.github.io/)

## Què permet fer?

- **Inici:** recompte de jocs físics i digitals, portades dels jocs que s’estan jugant o es volen jugar aviat, fins a tres portades aleatòries de la col·lecció, estables durant la visita amb renovació explícita, i propòsits de l’any actual. Estadístiques al final amb selecció directa; anys amb entrades, només els cinc més recents.
- **Plataforma:** un camp únic per a consoles, botigues o altres vies d’accés; opcions noves sense modificar el codi. Físic/digital és independent. Emulador només al log.
- **Col·lecció:** Galeria inicial amb portada o Llista compacta amb miniatures i valoracions, amb elecció conservada durant la navegació; filtres de plataforma, format i gènere; cerca i navegació d’un registre al següent.
- **log:** galeria amb portades, plataforma, valoració i estat de completat, agrupada per anys del més recent al més antic, encara que els jocs no siguin a la col·lecció. Accés separat al detall de l’entrada i al de Col·lecció quan hi ha exemplars actius relacionats. Un joc pot tenir entrades de diversos anys; les entrades sense any es conserven fora de la vista principal.
- **Valoracions i comentaris:** una valoració i un camp de comentaris per joc. A+ i A++ destaquen en vermell; una valoració en blanc és vàlida.
- **Propòsits:** pendents, fets o descartats, identificats amb text i color.
- **Estadístiques:** plataformes, gèneres, compres per any, jocs jugats i valoracions. Les categories enllaçades obren els registres corresponents.
- **Portades:** consulta manual d’IGDB i RAWG o introducció d’una URL.
- **Revisió de dades:** consulta de camps buits a Configuració, separada per joc, exemplar i entrada de log, amb accés al detall i navegació entre resultats. Només per al propietari.
- **Còpies de seguretat:** ZIP amb dades i fitxers de les portades, vinculacions i informe d’errors; exportacions CSV per consultar amb Excel.
- **Accés de convidats:** consulta sense poder modificar les dades, protegida també a la base de dades.
- **Recuperació:** enllaç per correu per canviar la contrasenya, i restauració de còpies ZIP amb revisió prèvia i portades guardades a Supabase.

## Captures

### Inici

![Inici: col·lecció, jocs en seguiment i propòsits](docs/captures/inici.jpg)

### Accés

![Formulari d’inici de sessió](docs/captures/acces.jpg)

## Codi públic, dades personals protegides

Aquest repositori conté el programa i la documentació. **No conté la base de dades personal**, els lots d’importació, contrasenyes ni còpies de seguretat. L’aplicació consulta Supabase després d’iniciar sessió; els permisos del propietari i dels convidats s’apliquen amb polítiques de seguretat a la base de dades (RLS).

Les captures mostren una part de la interfície; no donen accés a les dades. La URL i la clau *publishable* de Supabase són configuració pública del client. Les claus secretes i les credencials d’IGDB/Twitch i RAWG es mantenen al servidor.

## Tecnologia

React, TypeScript, Vite, Tailwind CSS, TanStack Query i Supabase. GitHub Actions compila i publica a GitHub Pages en cada pujada a `main`. El blog enllaça aquesta publicació independent.

## Desenvolupament local

Requereix Node.js 22. Copia `.env.example` a `.env.local` i indica la URL i la clau pública del teu projecte Supabase.

```sh
npm ci
npm run dev
```

La base de dades requereix l’esquema, les funcions i les polítiques descrits a [Arquitectura](docs/ARQUITECTURA.md). Crear només un projecte buit a Supabase no és suficient per executar totes les funcionalitats. Aquest repositori encara no ofereix un instal·lador de base de dades per a tercers.

```sh
npm run typecheck
npm run lint
node_modules/.bin/esbuild tests/*.test.ts --outdir=/tmp/tsumige-tests --bundle --platform=node --format=esm
node --test /tmp/tsumige-tests/*.js
node_modules/.bin/esbuild tests/record-creation-view.test.tsx --outfile=/tmp/tsumige-view-tests.cjs --bundle --platform=node --format=cjs '--define:import.meta.env={}'
node --test /tmp/tsumige-view-tests.cjs
npm run build
```

Les RPC dels formularis d’alta i els noms aprovats ja estan aplicats i validats. Les proves manuals d’altes noves continuen pendents perquè l’usuari no té registres reals per incorporar; no bloquegen aquesta publicació: [Formularis d’alta](docs/PROPOSTA-ALTES.md). Els noms de plataforma aprovats es presenten canònicament al client; la tanda conjunta de conversió i RPC es documenta a [Noms de plataformes](docs/NOMS-PLATAFORMES.md). Les proves PostgreSQL locals utilitzen metadades privades i registres sintètics; no connecten a Supabase.

Consulta [Publicació i manteniment](docs/PUBLICACIO.md) per al circuit de canvis i [Treball pendent](docs/PENDENTS.md) per a les limitacions i properes millores.

## Autoria i drets

Projecte d’[Israel Belchi](https://github.com/ibelchi).

Els textos i notes propis de l’autor es comparteixen amb **CC BY-NC-SA 4.0**. Aquesta llicència no s’aplica al codi, als logotips ni a les portades de tercers. No s’ha escollit encara una llicència per al codi; les dependències mantenen les seves llicències respectives.

*Observar per crear i enfilar per gaudir. Repetir.*
