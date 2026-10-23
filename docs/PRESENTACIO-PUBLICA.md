# Presentació pública: revisió del 23 d’octubre de 2026

README contrastat amb el diff, els components actuals i el workflow de Pages.
La publicació inclou el codi, les proves i la documentació de la tanda d’edició
i Inici. Les captures existents es conserven: renovar-les no bloqueja aquesta
entrega i no s’han generat imatges ni simulacions per a la presentació pública.

## Comportament documentat

- Cinc targetes d’Inici centrades i adaptables, amb icones Lucide i accents
  suaus en Clar/Fosc: físics, digitals, Vull jugar, top A+/A++ i Jocs MEH D.
  Recomptes d’exemplars actius coherents amb Col·lecció; percentatges amb tota
  la col·lecció, també la no valorada. Enllaços sense filtres residuals.
- Cercador global ample sota les targetes. S’ha verificat el seu funcionament
  sintètic amb clic/toc/teclat; no s’ha canviat la seva lògica sense reproduir
  el bug antic. Col·lecció incorpora el filtre de valoracions, inclòs OR Top.
- Edició compartida de Col·lecció/log: nom editable, valoració compacta,
  dues capses de caselles segons l’àmbit, camps curts i comentaris/configuració
  amples. Accions a dalt i a baix, un únic controlador de confirmació i
  cancel·lació amb Esc que no tanca el detall pare.
- Plataforma existent protegida. El README explica la limitació breument;
  [EDICIO-I-RESUM-INICI.md](EDICIO-I-RESUM-INICI.md) en detalla els vincles,
  les guardes i la correcció futura. No es presenta com a edició disponible.
- Cap pujada de portada pròpia, vídeo incrustat ni funcionalitat pendent es
  presenta com a implementada. No s’han modificat dades, esquema ni RPC.

## Captures conservades i renovacions pendents

Rutes relatives a aquest document; el README les referencia amb `docs/`.

| Fitxer real | Ubicació al README | Estat |
| --- | --- | --- |
| `screenshots/inici.png` | Després de la presentació. | Renovar: mostra els dos recomptes antics i el cercador al costat; falten les cinc targetes i la barra actual. |
| `screenshots/colleccio.png` | Captures de pantalla → Col·lecció. | Renovar: falta el filtre de valoració i la barra lateral actual. |
| `screenshots/log.png` | Captures de pantalla → Log. | Renovar: filtres i barra lateral anteriors. |
| `screenshots/detall.png` | Captures de pantalla → Detall d’un videojoc. | La consulta continua sent representativa; completar amb una captura real d’edició. Encara no hi ha un fitxer d’edició. |

No s’ha substituït, retallat ni recomprimit cap PNG. Les rutes relatives,
textos alternatius i amplada declarada de 1000 px es mantenen. Tampoc s’hi
incorporen captures de mòbil. Les imatges són les facilitades anteriorment
per l’usuari; les captures sintètiques de les proves queden fora del repositori.
Les antigues `captures/inici.jpg` i `captures/acces.jpg` no es referencien al README.

## GitHub About: proposta que continua sense aplicar

- **Description:** `Tsumigē · Col·lecció de videojocs i log personal en català. Portades, valoracions, propòsits i estadístiques; modes clar i fosc.`
- **Website:** `https://ibelchi.github.io/Tsumige/`.
- **Topics:** `video-games`, `game-collection`, `game-tracker`, `react`, `typescript`, `supabase`, `catalan`.

La configuració externa d’About/topics no s’ha modificat ni revalidat en
aquesta tanda. No proposar tràilers incrustats, PWA ni pujades pròpies com a
funcions disponibles. La llicència del codi continua sense decidir-se;
CC BY-NC-SA s’aplica als textos propis, no automàticament al programa.

## Abast i verificació

Commit de client, estils, filtres, proves i documentació relacionats amb
l’edició i Inici. Es preserva «Fitxes de videojocs» a Revisió de dades, ja
publicat anteriorment; no hi ha canvis nous a `data-review.tsx`.

TypeScript, ESLint, proves lògiques/renderitzat i compilació abans de publicar.
Les proves Chromium són sintètiques: 12 combinacions d’edició, 8 d’Inici i
24 d’amplada/tema/moviment per al refinament de targetes. No acrediten les
comprovacions manuals ajornades d’altes, Gènere, incorporació des del log,
permisos reals, eliminació fictícia, tema, restauració i persistència remota.

La verificació efectiva del push, Actions i els recursos servits per Pages
s’informa al lliurament; no equival a provar una sessió autenticada.
