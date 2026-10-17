# Estat actual i relleu de Tsumigē

## Entrega autoritzada d’etiquetes i filtres — 17 d’octubre de 2026

- S’inclouen els canvis locals aprovats de les tres caselles, filtres uniformes
  de Col·lecció/log, cerca/any en URL, CSV/ZIP i «Fitxes de videojocs» a Revisió
  de dades. La migració ja aplicada i verificada per l’usuari és només historial
  de referència: publicar el client no executa SQL ni modifica Supabase.
- Captura real de Col·lecció actualitzada al README amb el fitxer facilitat per
  l’usuari; Inici, log i detall es conserven. Originals fora del repositori intactes.
- Publicació via workflow existent de Pages en pujar main, sense force push.
  L’estat efectiu de desplegament i la correspondència dels recursos públics
  amb l’artefacte s’informen després d’executar-lo; no confondre controls locals
  amb interaccions autenticades de la web publicada.
- Continuen pendents totes les comprovacions manuals ajornades: Gènere, altes,
  afegir des del log, permisos reals, eliminacions/neteja, persistència real de
  les etiquetes i sincronització, restauració remota, dispositiu físic i tema.
  Les proves Chromium sintètiques no les substitueixen.
- Les seccions següents documenten el procés anterior. «Local/no publicat»
  es refereix a aquella fase; aquesta és l’entrega preparada per main. Materials
  de recuperació, informes, CSV/ZIP i credencials fora de la publicació.


## Filtres reorganitzats de Col·lecció i log — 17 d’octubre de 2026

- Cerca destacada en fila pròpia; després botons d’etiquetes uniformes i visibles;
  filtres generals agrupats; Llista/Galeria de Col·lecció alineats a la dreta.
  Àrees de botó de 44 px, aria-pressed, focus i verd actiu del tema compartit.
- Col·lecció: Favorits/Amb infants mantenen l’exclusivitat anterior. No jugat
  independent; Vull jugar-hi/No vull jugar-hi excloents i desactivables amb un
  segon clic. Combinables amb cerca/plataformes/gènere/format. Sense selector
  d’intenció ni casella No jugat als filtres; formularis d’edició intactes.
- Log: mateixa estructura, Amb infants i les tres marques del joc, any i
  plataformes. No Favorits (marca d’exemplar, sense correspondència única al
  log), format ni Llista/A–Z nous. Manté agrupació per anys i galeria única.
- URL: marques existents conservades; cerca ara usa cerca i any usa any com a
  font d’estat, també després de recarregar o navegar enrere. Les seleccions
  noves no eliminen els altres paràmetres. Retorn del detall i canvi de vista
  comprovats amb filtres actius. Les entrades sense any continuen fora del log
  principal, sense eliminar-les ni deduir-ne marques.
- Controls superats: TypeScript, ESLint, compilació, 63 proves de lògica i 32 SSR.
  Actualitzada la prova antiga d’any abans de cerca: la cerca passa al primer lloc
  segons la nova decisió. Avís conegut del JavaScript >500 kB, sense errors.
- Chromium amb menú lateral real i dades sintètiques: Col·lecció/log a 390/768/
  1440 px, Clar/Fosc; botons i exclusivitat, teclat, plataforma/gènere/format/any,
  URL, Llista, retorn del detall i recàrrega; àrees tàctils i cap desbordament.
  Captures a /tmp revisades. Convidat pot filtrar; sense peticions externes ni
  desaments. No acredita permisos remots, dispositiu físic ni sessions reals.
- Canvis locals, sense SQL, Supabase, commit, push o publicació. Totes les proves
  manuals ajornades anteriors, especialment altes i eliminacions, continuen pendents.


## Ajust vigent: tres caselles de marques — 17 d’octubre de 2026

- Substituït el selector d’intenció dels formularis per tres caselles visibles:
  No jugat independent, Vull jugar-hi i No vull jugar-hi excloents i desmarcables.
  El model i el camp intencio_joc no canvien; un input ocult transporta el valor.
- Edició: grup Etiquetes del videojoc junt amb Per jugar amb infants, separat
  de les marques d’exemplar. Fora de Configuració. Altes amb el mateix component;
  joc existent manté la consulta compartida i l’acció explícita d’editar.
- Diagnòstic: el servidor localhost:5173 servia un record-editor amb GameLabelFields
  connectat fora de Configuració; el codi anterior mostrava un selector, no tres
  caselles. No s’ha reproduït l’absència comunicada al navegador de l’usuari ni
  acreditat memòria cau/versió antiga. URL concreta pendent de confirmar. Només
  comprovar HTTP 200 a la tanda anterior era insuficient per acreditar els controls.
- Chromium amb fixtures sintètiques: alta/edició Col·lecció/log, tres caselles
  visibles amb Configuració tancada, exclusivitat/desmarcació, independència,
  teclat, convidats, 1440/390 px i Clar/Fosc sense desbordament. Captures locals
  revisades. Peticions externes bloquejades i cap desament. Això no acredita
  persistència remota, dades reals de l’usuari ni dispositiu físic.
- TypeScript, ESLint, compilació, 62 proves de lògica i 32 SSR; avís de bundle
  existent. Totes les comprovacions manuals ajornades es mantenen. Sense SQL,
  canvis remots, commit, push o desplegament. Substitueix les notes anteriors
  que prescrivien un selector d’intenció en alta/edició; filtres i CSV intactes.


## Estat vigent: etiquetes del joc — 17 d’octubre de 2026

- L’usuari confirma la migració d’etiquetes aplicada i el diagnòstic posterior:
  verificat=true, diferencies=[], totes les comprovacions correctes; 454 fitxes,
  441 exemplars, 203 entrades i 4 propòsits. No repetir SQL ni recuperacions.
- Client implementat localment, encara sense publicar: No jugat independent i
  intenció única opcional Vull jugar-hi / No vull jugar-hi, a fitxes_joc.
  Edició/alta en formularis existents, etiquetes actives al detall, filtres URL
  tant a Col·lecció com al log, CSV i validació ZIP compatibles amb còpies antigues.
  Les claus absents de còpies antigues es mantenen absents per preservar les
  marques actuals al servidor. Lectura/còpia SELECT * i RPC existents reutilitzades.
- No es dedueix No jugat del log ni es canvien Jugant, Per jugar aviat, Favorit
  o Amb infants. Cap camp nou a exemplars/entrades ni pantalla nova.
- Controls d’aquesta tanda: TypeScript, ESLint, compilació, 13 fitxers de proves
  de lògica i 32 proves SSR. Avís existent de bundle >500 kB. Sense executar SQL,
  modificar dades remotes, fer commit, push o desplegament.
- Pendents: proves interactives de les marques (desar/desfer/error, compartició,
  convidats, filtres/retorn i CSV/ZIP) i revisió visual mòbil/Clar/Fosc. Totes les
  comprovacions manuals ajornades anteriors continuen pendents.

Les seccions de publicació següents conserven l’historial; no acrediten que
els canvis locals d’aquesta tanda estiguin publicats.

Comprovat el 15 d’octubre de 2026.

Entrega posterior autoritzada en preparació: marc IGDB 132:187 amb retall centrat i valoracions úniques al costat del títol. Inclou els canvis locals aprovats de detall compacte (1000 px), accions Edita/Elimina/Tanca superiors, confirmació segura, icones de cerca externa i correcció de selecció/focus del cercador. Aquest estat substitueix les ubicacions i criteris visuals de la publicació anterior descrita més avall. Vegeu l’encapçalament de PENDENTS per a proves i limitacions. El resultat de la nova publicació s’informa separadament en completar-la. Aquest resum i l’encapçalament de [PENDENTS.md](PENDENTS.md) defineixen l’estat vigent; les notes antigues conserven el procés i no són ordres per repetir operacions.

## Repositori i publicació

- Projecte local: `/home/belchi/projectes/Tsumige`. Branca `main`.
- Local i `origin/main` coincideixen en `09a4be16eb176f3a70afdefa2da61121a8fc1d72`, «Afegeix temes Clar/Fosc i eliminació independent de registres». Fetch executat; divergència 0/0 i directori net abans d’aquest relleu.
- Remot: https://github.com/ibelchi/Tsumige.git. Aplicació publicada: https://ibelchi.github.io/Tsumige/.
- [GitHub Actions 38638762048](https://github.com/ibelchi/Tsumige/actions/runs/38638762048): compilació i desplegament correctes per aquell commit. HTML, CSS i JavaScript públics contrastats amb l’artefacte de Pages; això acredita el lliurament, no les interaccions autenticades.
- En el relleu inicial no quedava codi pendent; després s’han acumulat els ajustos aprovats indicats a l’encapçalament. Preservar-los i publicar-los conjuntament després dels controls autoritzats.

## Implementat i publicat

- Inici: recomptes físic/digital compactes amb enllaços nets als filtres; cercador de tots els jocs accessibles; Jugant/Per jugar aviat independents amb tres inicials i desplegament; propòsits actuals i Jocs a l’atzar; estadístiques al final amb tres icones i cinc anys disponibles més recents.
- Atzar: Tots/Top al costat del títol, cada clic renova inclòs l’actiu; Top només A+/A++; fins a tres jocs actius amb portada, selecció persistent durant la visita. No Favorits ni fletxes verdes en aquest quadre.
- Col·lecció i log: galeries adaptables de tres/dues/una columna segons espai real; Llista amb miniatures a Col·lecció. Galeria per defecte; filtres i elecció de vista conservats. Log agrupat per anys, sense entrades sense any a la vista principal, però conservades.
- Filtres ràpids Favorits/Amb infants excloents; clic a l’actiu desactiva; combinables amb cerca/plataforma/format. URL antiga amb tots dos prioritza Favorits. Estrella plena ocre de Favorit, independent de valoració.
- Detall adaptable: consulta inicial, Edita només propietari, desament/desfer mantenen el joc, protecció dels canvis pendents. Portada sencera amb valoració i font existents sota la imatge; només etiquetes activades. **Anterior/Següent només a baix, agrupats a la dreta**; filtres/ordre/límits conservats.
- Eliminació del propietari amb confirmació: Col·lecció elimina només l’exemplar obert; log només l’entrada oberta. Conserva joc, portada, valoració, comentaris i altres relacions. Fitxa eliminable només sense cap exemplar, tampoc històric, ni entrada; accessible pel cercador d’Inici i detall directe. Sense cascades ni eliminació de portades. Identitat/permisos, ID/joc/propietari/timestamp i FK/RLS protegeixen l’operació; resposta perduda es reconcilia amb lectura, sense repetir DELETE automàticament. Retirada/reactivació i consulta Jocs retirats fora de la interfície; històrics i còpies compatibles.
- Altes: Col·lecció crea joc/exemplar sense log; log cerca per ID o crea fitxa/entrada sense exemplar. Any actual obligatori per noves entrades, control de duplicats joc/any sense consolidar antigues. Valoració/comentaris compartits amb edició explícita, Jugant global. Incorporació des del log reutilitza joc/plataforma i demana dades d’exemplar; Emulador exclòs. **Implementació i proves sintètiques no equivalen a validació manual real.**
- Gènere: selector únic opcional amb opcions existents ordenades i deduplicades a la interfície; afegir amb confirmació/cancel·lació només propietari. No fusiona dades antigues. La nova opció persisteix quan es desa el joc.
- Configuració: còpia ZIP i recuperació amb previsualització/confirmacions, exportació CSV i Revisió de dades al final. L’eina de camps buits diferencia àmbits; zero/false no són absència. Eines del propietari protegides.
- Tema: **només sol/Clar i lluna/Fosc, sense text visible ni Sistema**, centrats sota Configuració al menú, també al menú mòbil i per als convidats. Noms accessibles, ajuda, focus i estat actiu. Preferència al navegador; Clar inicial. Sistema antic es fixa una vegada al tema del sistema d’aquell moment, després no el segueix. Aplicació prèvia a React; portades sense filtres de color.

## Decisions i dades que cal preservar

- Text visible «log», «entrada de log»; no reanomenar rutes/taules per nomenclatura.
- Plataforma única, sense tipus interns maquinari/botiga. Títols iguals en plataformes diferents són jocs diferents; mai fusionar pel nom. Noms exactes a [NOMS-PLATAFORMES.md](NOMS-PLATAFORMES.md); XBOX és la primera Xbox i no Xbox 360/One.
- Físic/digital independent. Emulador només al log. No deduir una botiga a partir dels exemplars actuals.
- Valoració/comentaris únics per joc; any/completat de l’entrada; Favorit independent. Camps buits conservats, 0 € conegut, false vàlid.
- Els tres digitals aprovats de Switch es conserven històrics inactius; no esborra’ls automàticament. Els registres antics sense any i els exemplars múltiples preexistents no es consoliden. L’alta actual ofereix obrir un exemplar actiu existent i no el retira per substituir-lo.
- Les antigues propostes de llista del log, navegació superior, tres filtres d’atzar, cinc anys desplegables, filtres ràpids simultanis i selector amb Sistema han estat substituïdes pels criteris anteriors.

## Migracions aplicades: no repetir

- Plataforma, pla 002: aplicada una vegada per l’usuari, verificació posterior i material de reversió contrastats; comprovacions funcionals locals de Plataforma confirmades per l’usuari. Referència genèrica `202610090001_plataforma.sql`; procediment privat real diferenciat.
- Tanda conjunta d’altes atòmiques i noms: aplicada amb el script compacte privat, rebut `verificat=true` i comparació semàntica validats; RPC `versio_altes`/`alta_registre`, noms i permisos contrastats. Referències `202610110001_altes_atomiques.sql`, `202610130001_noms_plataformes.sql`; no executar de nou, ni l’antiga proposta separada Game Boy. 123 fitxes normalitzades aleshores, sense alterar vincles.
- Restauració ja disponible, amb historial genèric `202610070006_restauracio.sql`. L’existència de fitxers SQL no és una instrucció per executar-los ni un diagnòstic actual del servidor.
- Materials privats persistents fora de Git, a `/home/belchi/tsumige-plataforma-privat`. No publicar informes, plans, identificadors reals, captures, ZIP o bundles. Cap SQL, reversió ni registre modificat en aquest relleu. No s’ha fet una auditoria administrativa nova de Supabase.

## Evidència automàtica i límits

- Publicació anterior: TypeScript, ESLint, dotze fitxers de proves de lògica, renderitzat sintètic i compilació correctes localment i a Actions. Proves locals d’eliminació sobre esquema reconstruït: permisos de convidat, FK RESTRICT incloent històrics, ID correcte, recomptes i dades compartides preservades, joc sense vincles eliminable. Restauracions v1/v2 i RPC provades en tandes locals amb dades sintètiques.
- En aquest relleu: repetits ESLint, compilació amb TypeScript, lògica i renderitzat sintètic. No s’ha executat cap SQL. Avís existent de JavaScript superior a 500 kB; no és error de compilació.
- Proves sintètiques/SSR i comprovació HTTP no acrediten clics, focus real, contrast visual, sessions convidades remotes, Auth/Storage API, concurrència real ni restauració remota. Cal diferenciar les confirmacions anteriors de l’usuari de proves fetes per l’agent.

## Comprovacions manuals ajornades: totes pendents

1. Gènere a mòbil/escriptori: buits, duplicats, nova opció, confirmar/cancel·lar, persistència i permisos.
2. Altes de Col·lecció i log: tots els recorreguts, duplicats, 0 €, any, camps compartits, desament/error/consulta i permisos. Una alta real al mòbil informada anteriorment és només aquella observació, no una validació general.
3. Afegir a Col·lecció des del log: dades, històrics, doble clic/concurrència, errors, actualització i retorn amb filtres; permisos propietari/convidat.
4. Alta fictícia i eliminació independent d’exemplar/entrada: confirmar què es conserva, llistes/recomptes, portada/valoració/comentaris a l’altre àmbit, neteja del joc sense vincles; cancel·lació, errors/resposta perduda i convidats. No fer proves destructives sobre dades personals.
5. Tema: contrastos, marca/substituts, portades intactes, càrrega sense flaix, selecció/persistència, conversió de Sistema, mòbil/escriptori, diàlegs i accés/recuperació.
6. Resta de revisions visuals/interactives documentades: galeries/log, cerca/teclat/Esc/clic fora, filtres/retorn, navegació inferior i protecció d’esborranys. Auth/Storage/PostgREST, recuperació/restauració remota i concurrència sense prova real continuen sense acreditar.

## Ajornat o descartat

- Ajornats: revisió/compleció de dades i portades, revisió general del detall i discrepàncies obertes de [AUDITORIA-DETALL.md](AUDITORIA-DETALL.md). Revisar-les abans de decidir canvis de model.
- Propostes només: pujada de portada pròpia ([document](PROPOSTA-PORTADES-PROPIES.md), requereix avisar abans de SQL/RPC), bloc editorial a Inici, tràilers assistits/YouTube, enllaços externs amb preferència MobyGames i revisió d’enllaços que distingeixi trencament de bloqueig/error temporal.
- Descartada explícitament l’ordenació manual de Jugant/Per jugar aviat: no implementar ni preparar migracions. Vegeu [historial](PROPOSTA-ORDRE-INICI.md).
- PWA i filtre físic/digital per any continuen descartats segons l’historial. L’antic descart del mode fosc ha quedat substituït per la implementació actual.

## Continuar

Llegir `AGENTS.md`, aquest resum i l’encapçalament de PENDENTS; comprovar Git abans de treballar. No iniciar funcionalitats ni repetir SQL per inferència. Per a una propera tanda, concretar primer l’objectiu amb l’usuari, preservar la feina de relleu local i donar passos de comprovació després dels canvis.
