# Lectures — experiment local

## Prova i retirada

`npm run dev` activa el bloc a la barra lateral de totes les seccions.
En mòbil es mostra dins del menú desplegat, sense una barra permanent;
la navegació continua tancant el menú. L’amplada de la barra continua sent
248 px i permet scroll en escriptori amb poca alçada. Navegació i tema van
abans de les lectures. Inici recupera el contenidor original `page-container`,
sense columnes ni espais reservats. No es modifiquen les mides de portades.

El servidor Vite consulta els tres RSS públics, sense passar per Supabase.
Obre l’adreça de Vite (en aquesta prova http://127.0.0.1:5192/Tsumige/) i inicia
sessió habitualment. La fixture `/Tsumige/tests/fixtures/readings.html` empra
jocs sintètics i no valida permisos reals.

No hi ha selector de modalitat: es mostren les tres publicacions més recents
entre tots els canals, de més nova a més antiga, sense quotes de categories.
Les modalitats Equilibrada/Lectures de fons de la primera proposta se
substitueixen per aquesta decisió. Títol i data només: ni tipus ni font repetida.
El títol complet es conserva al DOM (accessible), amb `title` natiu i limitació
visual experimental de tres línies; el focus del teclat continua visible.
El component compartit manté una única consulta amb la mateixa memòria cau
quan es canvia de secció. En mòbil, tancar el menú només l’oculta.

Per retirar l’experiment, afegeix `VITE_ENABLE_READINGS=false` a `.env.local`
sense substituir-ne les altres línies, i reinicia Vite. Inici recupera
l’amplada i distribució anteriors, sense columna buida ni consulta RSS.
La compilació de producció el desactiva per defecte. `true` l’activaria,
però **no s’ha de publicar activat abans de desplegar i validar lectures**.

## Dades i límits

- Fonts fixes: `/articulos/feed`, `/analisis/feed` i `/feed` d’AnaitGames.
- Es rebutgen categories exactes Podcast, Recarga Activa, Podcast Reload i
  rutes /podcast/. No es filtren paraules dels títols.
- Només es retornen títol, URL normalitzada, data, categories i canals.
  No s’envien descripcions, autors, imatges ni contingut complet al client.
- URL HTTPS d’AnaitGames; fragments i paràmetres de seguiment eliminats.

- Lector limitat a RSS 2.0, CDATA i entitats XML/numerals; rebutja DTD i
  entitats externes. No és un parser XML genèric ni processa HTML.
- Descàrregues limitades a 3 MB/font i 12 segons; fonts en paral·lel.
- Memòria cau de sis hores en servidor i navegador, peticions simultànies
  agrupades. Fonts parcials o dades antigues: reintent després de cinc minuts.
  Sense cap font ni memòria cau: error controlat i pausa de servidor d’un minut.
- La memòria cau de servidor és volàtil i per procés/isolate. En una Edge
  Function no garanteix sis hores compartides entre totes les instàncies.
  No s’han creat taules ni afegit serveis per garantir persistència global.
- Enllaços amb pestanya nova i noopener/noreferrer. Les dates són absolutes
  en català per evitar ambigüitat en lectures antigues.

## Codi al repositori i activació de producció

`supabase/functions/lectures/index.ts` és una funció nova independent;
no altera bright-worker ni game-metadata. Consulta exclusivament les fonts
fixes. Exigeix sessió validada amb Auth abans de retornar els RSS públics;
no consulta ni escriu registres. Utilitza variables estàndard de servidor
SUPABASE_URL/SUPABASE_ANON_KEY, mai credencials IGDB ni service_role.
Admet l’origen de Pages; altres orígens es poden declarar expressament
amb LECTURES_ALLOWED_ORIGINS (llista separada per comes).

La publicació del codi al repositori està autoritzada. El workflow de Pages
no activa Lectures ni desplega la funció. No s’ha desplegat ni executat aquesta
funció en Deno/Supabase. Abans d’activar-la cal autoritzar el desplegament i
validar autenticació real
(propietari/convidat, sessió caducada, sense sessió), CORS i comportament de
la passarel·la de Supabase amb la configuració real. Després es podrà activar
VITE_ENABLE_READINGS=true en la compilació pública. No requereix SQL/RPC.

## Validació

Proves sintètiques de filtratge, selecció, deduplicació, memòria cau, fonts
parcials i fallada total; renderitzat accessible i enllaços externs.
Chromium amb Home/AppShell sintètics: 390, 768, 1440 i 1920 px, Clar/Fosc,
focus, absència de desbordament, menú mòbil, barra de poca alçada, navegació
entre seccions sense duplicar la consulta i buits/errors independents d’Inici.

Resultat local: TypeScript, ESLint i compilació correctes; 68 proves lògiques
(incloses cinc de Lectures), 32 proves de renderitzat existents i tres de
Lectures superades. Setze combinacions d’amplada/alçada/tema en Chromium i estats
buit/error/parcial correctes. Consulta real local: 25 entrades elegibles,
sense duplicats/podcasts a les seleccions; tres enllaços comprovats amb HEAD
HTTP 200. Avís de Vite per mida del bundle (>500 kB), sense error.
La funció Edge passa comprovació estàtica TypeScript; manca execució Deno
real i verificació de Supabase. Punt previ de restauració (arxiu de Git,
HEAD 969de658): `/tmp/tsumige-abans-lectures-20261022/`, fora del repositori;
/tmp és temporal. El mecanisme habitual de retirada és l’indicador local.

Les comprovacions manuals anteriors continuen pendents. Validar en la
sessió local real la llegibilitat i les lectures escollides, els enllaços,
el retorn dels detalls i la navegació a Col·lecció/log. La prova sintètica
no equival a provar permisos reals ni un dispositiu físic.
