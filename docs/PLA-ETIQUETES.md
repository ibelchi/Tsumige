# Etiquetes del joc: preparació de la migració

Estat vigent: **migració aplicada i verificada segons confirmació de l’usuari;
client implementat localment, pendent de revisió i publicació** (17-10-2026).
Resultat confirmat: verificat=true, diferencies=[], totes les comprovacions
correctes; 454 fitxes, 441 exemplars, 203 entrades i 4 propòsits, sense valors
invàlids ni pèrdua de registres. No s’ha fet una consulta remota des de Codex.
**No tornar a executar la migració ni recuperar RPC per publicar el client.**
Les seccions de preparació següents són historial; la confirmació anterior
substitueix les mencions de verificació pendent.

## Model acordat

`fitxes_joc.no_jugat boolean NOT NULL DEFAULT false` i
`fitxes_joc.intencio_joc text DEFAULT NULL`, amb CHECK que admet només NULL,
`vull` o `no_vull`. Les sis combinacions acordades són representables; les dues
intencions no poden coexistir. Les marques són comunes a totes les relacions del
mateix ID de joc; mai s'agrupen pel títol. No s'infereix res del log ni es creen
fitxes. L'absència de No jugat significa jugat només per convenció.

No es canvien Jugant, Per jugar aviat, Favorit, Amb infants, plataformes, vincles,
compres, comentaris, valoracions, historials ni portades. Els registres existents
reben false/NULL sense UPDATE massiu ni canvi explícit dels timestamps.

## RPC i dependències

La migració `supabase/migrations/202610170001_etiquetes_joc.sql` adapta, en una
transacció, tres cossos de funció mitjançant ancoratges únics comprovats:

| RPC modificada | Contracte conservat | Finalitat |
| --- | --- | --- |
| desar_registre | (text,uuid,jsonb,jsonb) → void | Escriure només les claus noves presents al JSON |
| alta_registre | (text,uuid,uuid,jsonb,jsonb,boolean,timestamptz,jsonb) → jsonb | Incloure les marques quan es crea o s'edita explícitament una fitxa |
| restaurar_copia_legacy | (jsonb,boolean,text) → void | Completar claus absents i restaurar les presents |

`desar_registre_plataforma`, `crear_registre` i `crear_registre_plataforma`
deleguen en el desament original. `restaurar_copia` i
`restaurar_copia_plataforma` deleguen en el motor legacy; no cal canviar-ne
signatures ni cossos. No es toca `versio_altes`, `versio_plataforma`, els
triggers de dades compartides ni `normalitza_plataforma`.

`estat_restauracio` ja calcula l'empremta amb to_jsonb de les files senceres:
inclourà els nous camps automàticament. Una previsualització oberta abans del
canvi tindrà una empremta caducada: cal repetir la previsualització, no ometre
la guarda. Consultes del catàleg i còpies fan SELECT *.

Es fa CREATE OR REPLACE a partir de pg_get_functiondef: conserva OID, noms i
arguments, resultat, llenguatge, search_path, propietari i ACL. El script
comprova SECURITY INVOKER, tipus de retorn i propietari/ACL abans/després.
No fa DROP, renoms, GRANT, REVOKE, noves polítiques, taules ni RPC públiques.
Els ancoratges absents/repetits i una aplicació repetida avorten tota la transacció.
No és un mecanisme per acceptar qualsevol esquema: cal contrastar els cossos
complets i les dependències reals abans d'autoritzar l'aplicació.

## Compatibilitat

- Clients antics: si no envien una clau, el desament conserva el valor actual.
  Clients nous: false desmarca No jugat; NULL esborra la intenció.
- No jugat ha de ser un booleà JSON real: NULL, cadenes i números es rebutgen.
  La intenció admet NULL o els dos textos exactes; altres valors fallen.
  L'error reverteix tota l'operació RPC.
- Altes antigues: el nou joc parteix dels defaults. Afegir un exemplar o una
  entrada a un joc existent no canvia les marques si no s'edita explícitament.
- Còpies antigues: abans del populate_recordset, es completen individualment
  les claus absents amb els valors del joc existent, o false/NULL si és nou.
  Això evita que el populate produeixi NULL per al booleà obligatori.
- Còpies noves: les claus explícites es restauren, inclòs false/NULL. En mode
  només afegir no es modifiquen les marques dels IDs ja existents.
- Es conserven les regles de plataforma v1/v2: aquesta migració no autoritza
  sobreescriure plataformes resoltes amb còpies antigues incompatibles.
- El validador actual del client conserva claus desconegudes; encara cal
  afegir validació explícita, tipus TS, controls i CSV en la fase següent.
  La validació del servidor no depèn del validador del navegador.
- Un client antic que enviï un objecte complet antic amb claus explícites
  obsoletes pot sobreescriure valors: es garanteix la preservació quan les
  claus falten, no una resolució general de conflictes entre dispositius.

## Abans de l'aplicació: comprovació única i assaig

No s'ha fet cap connexió remota des de Codex. La consulta agrupada executada
per l'usuari ja s'ha rebut i contrastat (vegeu el resultat al final). Les
captures històriques, per si soles, no acrediten l'estat vigent.
La lectura administrativa agrupada cobreix: definicions/signatures/retorns,
OID, propietari, ACL, SECURITY INVOKER/search_path i dependències de les RPC
anteriors; columnes/defaults/CHECK, triggers, RLS/polítiques i permisos efectius
anon/authenticated/PUBLIC de fitxes_joc; funcions pot_editar i
propietari_consulta; versions d'altes/plataforma. Guardar el resultat privat,
sense publicar definicions que continguin informació privada.

La comprovació ha de confirmar especialment que el motor legacy conserva els
locks i l'empremta abans de l'INSERT, declara row_data/owner, i que les RPC
deleguen com aquí s'explica. Les guardes d'ancoratge no substitueixen aquesta
revisió ni una auditoria de permisos. No s'amplien els permisos dels convidats.

Abans d'autoritzar SQL remot, reconstruir l'esquema contrastat en una base
local aïllada i provar-hi, en una fase posterior autoritzada:

- les sis combinacions, false explícit, NULL explícit i claus omeses;
- booleans nuls/textuals, intencions invàlides i rollback de l'operació sencera;
- desament original i wrapper, alta nova i ús existent amb/sense edició;
- còpies v1/v2, claus absents individuals, només afegir/actualitzar, nous IDs;
- RLS de propietari/convidat/anònim, ACL/OID/signatures sense canvis;
- fitxa amb múltiples exemplars/entrades, dades i timestamps preexistents;
- esquema inesperat, ancoratge absent, reexecució i rollback de DDL;
- reversió d'esquema assajada amb originals, amb dades sintètiques.

## Resultat de la validació local

PGlite instal·lat només a `/tmp/tsumige-etiquetes-test`, sense dependències del
projecte ni serveis nous. Base PostgreSQL en memòria, reconstruïda amb la
captura històrica privada d'esquema de la tanda altes/noms i la definició local
de la RPC alta_registre. Només s'han utilitzat registres sintètics. Auth i
Storage són substituts mínims locals; no simulen els serveis ni PostgREST.

Prova repetible: `node supabase/tests/local/etiquetes.mjs /ruta/privada/esquema.json`.
També admet TSUMIGE_PGLITE_MODULE per indicar un altre mòdul PGlite local.

Superats: migració completa; defaults i preservació de files/timestamps;
OID/signatures/retorns/ACL/propietaris/config; sis combinacions via desament;
client antic que omet camps; modificacions independents; valors invàlids i
rollback; còpies v1/v2 amb claus absents o presents, inserció/actualització/només
afegir; alta amb etiquetes; convidat sense escriptura i anònim sense accés;
reexecució bloquejada; reversió local de funcions i columnes; error d'ancoratge
després del primer pedaç amb rollback de DDL/funcions. Consulta diagnòstica
executada localment dins d'una transacció READ ONLY.

Correcció detectada per PostgreSQL: parentitzar CASE a la guarda del tipus de
retorn per evitar un error de sintaxi PL/pgSQL. Cap canvi al client.

Aquests resultats no validen l'esquema remot vigent, Auth/Storage/PostgREST,
concurrència multiclient, totes les variants de còpies ni tots els recorreguts
antics. Resta contrastar la captura nova i repetir els assajos pertinents si
hi ha diferències. La reversió provada és només d'esquema sobre la base local;
retirar columnes elimina marques: no és una recuperació de dades remotes.

## Seqüència segura i intervenció manual

1. Confirmar l'esquema real amb la lectura agrupada i completar l'assaig local.
2. Preparar privadament les definicions originals, metadades/ACL i còpia
   restaurable dels objectes afectats; verificar ZIP de dades/portades. No
   reutilitzar bundles de Plataforma/altes com a reversió d'aquesta tanda.
3. Evitar altes/restauracions durant l'aplicació breu. Els locks poden esperar
   o fallar després de 5 s: si fallen, no hi ha aplicació parcial. No prometre
   indisponibilitat zero amb DDL; triar una finestra curta sense operacions.
4. Només amb autorització posterior: l'usuari podrà executar **un únic bloc**,
   el fitxer de migració complet, al SQL Editor. No aplicar-lo encara.
   Si hi ha error, conservar-lo i comprovar l'estat abans de reintentar.
5. Verificar columnes/defaults/CHECK, dades prèvies excloent els camps nous,
   totals/IDs/vincles/timestamps, RPC/ACL/RLS, i que tots els registres inicials
   tenen false/NULL. Recarregar l'esquema PostgREST (NOTIFY documentat al final
   del fitxer) dins de l'aplicació definitiva quan es validi l'assaig.
6. Després implementar tipus/validació, edició, detall, filtres i CSV; executar
   TypeScript, ESLint, compilació, proves i revisió manual mòbil/Clar/Fosc.
   Publicar només amb autorització i servidor verificat. El client actual pot
   continuar treballant mentre no s'hagi desplegat la nova interfície.
7. Provar amb registres sintètics autoritzats: desar marques des d'un dispositiu,
   consultar des d'un altre i amb convidat; provar client antic i restauració.
   No fer proves d'escriptura sobre dades reals per validar la migració.

## Recuperació

Una fallada abans del COMMIT reverteix columnes, restricció i canvis de RPC.
Després del COMMIT, l'opció preferida és tornar al client anterior i mantenir
l'esquema additiu: les marques es preserven encara que el client no les mostri.
No executar cap SQL antic de reversió ni retirar columnes automàticament.

Si cal retirar l'esquema: pausar escriptures, exportar privadament les marques
per ID amb timestamps, contrastar que no hi ha canvis posteriors i recuperar
els cossos originals de les tres RPC mitjançant CREATE OR REPLACE, conservant
ACL/OID. Només després valorar eliminar CHECK/columnes, sense CASCADE i amb
revisió de dependències. Això perdria les marques de la base: requereix còpia,
assaig i autorització específica. Ara hi ha un script privat de recuperació
només de RPC, no executat (vegeu més avall); no s'afirma que el ZIP per si sol
recuperi funcions/permisos.

Totes les comprovacions manuals ajornades del projecte continuen pendents.


## Consulta prèvia única i retorn del resultat

Fitxer: `supabase/diagnostics/verificar_etiquetes_previ.sql`.
Conté una única SELECT amb CTE de catàlegs i funcions de metadades; no crida
RPC d'aplicació ni consulta files de videojocs, Auth o Storage.
Retorna una fila, columna `informe_etiquetes`, amb JSON ordenat per seccions.
Inclou camps/defaults/CHECK/FK, RLS, triggers, RPC completes, ACL i permisos
API, dependències registrades i detecció de camps equivalents. pg_depend no
recull totes les referències textuals de PL/pgSQL: revisar els cossos també.

Obrir el projecte correcte al tauler Supabase → SQL Editor → New query;
copiar el fitxer complet, executar-lo i exportar el resultat complet com CSV.
No executar el fitxer de migració en aquesta fase. La consulta es pot obrir
des de Windows amb `\\wsl.localhost\Ubuntu\home\belchi\projectes\Tsumige` (substituir
Ubuntu pel nom de la distribució si és diferent) o des de l'editor del projecte.

**Abans de compartir:** les definicions completes poden contenir literals
sensibles introduïts manualment. La consulta omet cossos amb indicis d'UUID,
correu, JWT o assignació de secrets, però aquest filtre no és infal·lible.
Revisar el CSV localment; no enganxar secrets a la conversa. Cal retornar la
ruta del fitxer privat, no publicar-lo ni afegir-lo a Git. Si hi ha omissions,
es contrastaran localment només les definicions necessàries després de revisar
la informació sensible. Cap contrasenya, token, ZIP o exportació de registres
és necessari per aquesta comprovació d'esquema.


## Contrast de la captura real rebuda

Resultat de la consulta prèvia rebut i analitzat sense modificar l'original.
No s'hi han detectat credencials reals; cap cos de funció omès. El CSV i les
metadades derivades es mantenen fora del repositori. Les referències a rols,
auth.uid i permisos són codi/metadades, no tokens d'accés.

- fitxes_joc existeix, RLS activa; no_jugat/intencio_joc i equivalents absents.
- Columnes, tipus, nul·labilitat i defaults de les cinc taules coincideixen amb
  la captura històrica emprada per a l'assaig. Restriccions, RLS i triggers
  contrastats, sense diferències en les definicions comparades.
- Les tres RPC afectades tenen signatures i retorns previstos, propietari
  postgres, SECURITY INVOKER, search_path buit i ACL explícites. No tenen
  EXECUTE concedit a PUBLIC/anon. Es conserva la concessió existent a
  authenticated/service_role; convidats limitats per pot_editar i RLS.
- Cossos de desar_registre i restaurar_copia_legacy coincidents amb els de
  referència; alta_registre coincideix amb la migració local d'altes. Els
  wrappers, locks, variable owner/row_data i empremta tenen les dependències
  esperades. No cal corregir els ancoratges de la migració d'etiquetes.
- normalitza_plataforma difereix de la captura anterior a noms, però coincideix
  amb la migració de noms ja aplicada: és esperat, no una discrepància nova.
- Revisades les dependències catalogades; pg_depend no substitueix la revisió
  dels cossos de les funcions amb referències textuals.

Repetida la suite local amb els cossos i ACL rebuts, sobre l'estructura històrica
que coincideix en les columnes/restriccions/polítiques/triggers comparats:
set grups de proves superats, inclosos restauració, clients antics, permisos,
reexecució, error parcial i reversió. El test ara reutilitza alta_registre si
ja existeix a l'informe, en lloc de recrear-la. Auth/Storage continuen sent
substituts locals i no s'acrediten interaccions remotes ni concurrència real.

Conclusió: compatible amb les metadades de la captura rebuda; no necessita
canvis SQL addicionals per aquest contrast. Abans d'executar-la encara cal
l'autorització expressa, còpia prèvia verificada i custòdia privada de les
funcions originals/ACL per a recuperació, segons el procediment anterior.
El CSV de metadades no és un dump restaurable. No cal repetir una exportació
idèntica sense motiu; si es modifica l'esquema abans d'aplicar, revisar el canvi.
Cap aplicació remota ni publicació executada; interfície encara no implementada.


## Còpia prèvia i recuperació preparades

### Protecció acotada i còpia completa

Per aquesta migració additiva, la protecció principal és el rollback de la
transacció i la conservació de les tres RPC originals. No s'actualitzen files
existents ni s'alteren Auth, convidats, Storage o altres taules. No cal restaurar
la base sencera per desfer un error de definició.

El ZIP de Configuració inclou dades de fitxes_joc, exemplars, experiencies i
proposits del propietari autenticat, amb tots els camps llegits, IDs, vincles,
històrics i portades descarregables, més portades.json i l'informe d'errors.
No inclou esquema, RPC, triggers, polítiques, grants, accessos_convidats,
comptes Auth, secrets ni Edge Functions. Tampoc garanteix tots els fitxers de
Storage: intenta descarregar portades dels jocs amb portada_url, no arxiva tot
el bucket ni fitxers sense URL assignada. Cap d'aquests components exclosos és
modificat per aquesta migració.

La restauració ZIP és una fusió/actualització del compte existent: conserva
registres que no són a la còpia, requereix el mateix user_id i servidor preparat,
respecta restriccions i pot canviar updated_at per triggers. Les portades es
pugen a rutes noves abans del commit de dades; Storage i la RPC no formen una
única transacció, i una fallada pot deixar fitxers pujats sense ús. No equival
a recuperar exactament tota una base, ni Auth, convidats o el bucket sencer.

Hi ha ZIP antics a Downloads. El més recent localitzat és del 12-10-2026:
CRC de totes les entrades correcte i dades.json/portades.json/LLEGEIX-ME presents.
No s'ha contrastat amb les dades actuals ni assajat la restauració d'aquell ZIP;
no serveix com a còpia definitiva de l'estat actual. No s'han copiat registres
reals, descarregat res del servidor ni llegit/exportat noves dades remotes.

Per a una recuperació integral independent: revisar Database → Backups al
panell de Supabase i disponibilitat/data de la còpia segons el pla. Si no hi ha
còpia adequada, caldria un dump lògic amb esquema/dades/rols acotats i assaig,
amb configuració privada i autorització addicional; no preparat ni executat ara.
Els backups de base de Supabase tampoc inclouen els bytes d'objectes Storage.
Fonts oficials: https://supabase.com/docs/guides/platform/backups i
https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore.
No es dona per disponible/verificada cap còpia del panell sense comprovar-la.

### Materials privats persistents

A `/home/belchi/tsumige-etiquetes-privat`, directori 0700 i arxius 0600:

- RPC-ORIGINALS.json: tres definicions completes, signatures, propietari,
  configuració, ACL i OID de la captura; empremtes originals/migrades i fonts.
- RECUPERA-NOMES-RPC-ORIGINALS.sql: recuperació manual transaccional amb
  comprovacions d'OID, propietari, ACL, configuració i cos original/migrat conegut;
  CREATE OR REPLACE i verificació posterior dels originals. Si detecta una
  modificació posterior de funcions/permisos o una altra base, avorta.
- MANIFEST-SHA256.json: integritat dels materials privats.
- LLEGEIX-ME.txt: instruccions i límits.

Extrets exclusivament de metadades ja autoritzades. No s'han copiat dades dels
videojocs ni el CSV al repositori. Hashes i permisos locals verificats.
El script NO s'ha executat, ni remotament ni localment en aquesta fase.
L'assaig anterior de CREATE OR REPLACE/recuperació d'esquema continua vigent,
però no equival a executar aquest nou script complet.

**Limitació important de restablir RPC antigues:** les etiquetes desades es
conserven a les columnes, però el client nou ja no les podrà desar amb aquestes
RPC. A més, restaurar_copia_legacy original no completa no_jugat quan manca a
una còpia antiga: amb la columna NOT NULL conservada la restauració pot fallar.
Tampoc actualitza les marques explícites dels IDs existents. Per tant, després
de recuperar les RPC, no utilitzar recuperació ZIP fins a preparar i provar un
motor compatible. No s'han d'eliminar columnes per esquivar aquest problema.

### Passos següents de l'usuari

1. Pausar edicions en tots els dispositius. Les quatre taules del ZIP es llegeixen
   en peticions separades: sense pausa no és una instantània transaccional.
2. A Tsumigē, com a propietari: Configuració → Còpia de seguretat → descarregar
   el ZIP. Esperar que acabi i conservar-lo privadament, també fora del disc de
   treball. No seleccionar ni confirmar cap restauració per provar-lo.
3. Si vols que l'agent el comprovi, facilitar-ne la ruta i autoritzar la lectura
   local. Revisió prevista: integritat CRC, JSON/format/compte, quatre taules,
   IDs únics i relacions, recomptes, manifest/bytes/tipus de portades i errors;
   distingir sense portada de descàrrega fallida. Un ZIP estructuralment correcte
   no prova per si sol la coincidència amb el servidor ni la recuperació integral.
4. Una recuperació del fitxer real en un entorn aïllat requereix autorització
   expressa per tractar-hi dades reals. Les proves sintètiques ja fetes validen
   recorreguts, però no acrediten un ZIP nou encara no rebut.
5. Amb còpia verificada i materials privats custodiats, autoritzar separadament
   l'aplicació. No executar encara cap migració ni recuperació.

### Incidents i edicions posteriors

- Error abans del COMMIT: rollback transaccional de DDL/RPC; no aplicar inversa.
  Si s'ha perdut la resposta, primer comprovar l'estat només amb lectura.
- COMMIT correcte però problema posterior: preferir mantenir esquema/RPC noves
  i tornar al client anterior. Les marques i les edicions posteriors es conserven.
- Recuperació excepcional de RPC: pausar operacions, conservar també l'estat
  actual, revisar la causa i autoritzar el script privat. No toca files ni retira
  columnes; exigeix cossos/permisos coneguts per no esborrar correccions noves.
- Restauració de dades: operació diferent, mai automàtica. Conservar primer una
  còpia actual i comparar per ID/timestamp; recuperar només registres aprovats
  o assajar en una base separada. No reemplaçar tota la base amb una còpia
  antiga si això faria perdre edicions posteriors.

No s'ha configurat cap accés nou, executat SQL remot, aplicat migració o
recuperació, ni publicat. Totes les comprovacions manuals ajornades es mantenen.


## Diagnòstic posterior a l'execució comunicada

Script únic privat, només lectura:
`/home/belchi/tsumige-etiquetes-privat/VERIFICA-DESPRES-ETIQUETES.sql` (0600).
S'ha mantingut fora del repositori perquè conté l'àmbit del compte i referències
reals de metadades. No incorpora registres de videojocs ni retorna informació
personal. No executa RPC d'aplicació, DDL ni operacions d'escriptura.

Compara columnes/defaults/CHECK, cossos esperats de les tres RPC (derivats de
la captura anterior i del pedaç exacte), OID/signatures/retorns/propietaris/ACL,
resta de funcions auxiliars, RLS, triggers, restriccions i permisos de taula i
columnes preexistents. Les columnes noves han de tenir ACL de columna nul·les,
conservant els permisos de taula que s'han contrastat.

Referència de dades: ZIP verificat del 16-10-2026 22:46:16 UTC, amb 454 fitxes,
441 exemplars (438 actius: 219 físics/219 digitals; 3 històrics), 203 entrades
(123 sense any) i 4 propòsits. Comprova recomptes i empremtes d'IDs/propietaris/
vincles de les quatre taules, relacions trencades o de propietari diferent,
valors invàlids i marques inicials false/NULL. No imposa consolidar els dos
exemplars físics preexistents ni les entrades sense any. El ZIP té dues portades
no descarregades; el diagnòstic no acredita la disponibilitat de Storage.

Assaig local: consulta executada en READ ONLY, amb esquema reconstruït i dades
sintètiques. Control positiu coherent retorna verificat=true; base diferent
retorna false. La migració només s'ha executat sobre la base de prova per
validar la consulta; cap SQL remot des de Codex, ni dades reals modificades.
Les empremtes de cossos de funció són exactes després de normalitzar CRLF;
les comparacions de metadades JSONB eviten falsos negatius per decimals.

L'usuari ha d'obrir aquest fitxer, copiar-lo sencer a SQL Editor → New query
amb el rol administratiu habitual i executar només la consulta. Exportar el
resultat complet, columna verificacio_etiquetes, a CSV i facilitar-ne la ruta.
S'esperen verificat=true, diferencies=[] i totes les comprovacions true.
Si hi ha diferències, revisar-les sense aplicar correccions, reversions o
repeticions de la migració automàticament. El diagnòstic no és una prova
funcional de les RPC ni compara tots els valors personals amb el ZIP.

No s'ha implementat la interfície. Cal esperar el resultat i contrastar-lo
abans de continuar; totes les comprovacions manuals ajornades es mantenen.


## Implementació local del client

Tipus opcionals únicament per compatibilitat amb còpies/catàlegs antics;
lectura i ZIP existents SELECT * conserven els dos camps. Formularis d’alta i
edició incorporen No jugat independent i un únic select d’intenció (cap/vull/
no_vull). Seleccionar un joc existent conserva les dades compartides i requereix
l’edició explícita ja existent; afegir només un exemplar no les modifica.
Consulta reutilitza les etiquetes actives, amb la mateixa fitxa en tots dos àmbits.

Filtres en URL tant a Col·lecció com al log, sense modificar altres filtres.
Convidats poden consultar i filtrar; permisos d’edició existents conservats.
CSV afegeix dues columnes de lectura, amb intenció etiquetada en català.
Validació ZIP accepta només booleans reals i intenció NULL/vull/no_vull quan
les claus existeixen; quan falten, les deixa absents fins a la RPC migrada.

Proves sintètiques de lògica/SSR: sis combinacions, independència d’altres marques,
FormData, exclusivitat de select, creació/edició renderitzada, convidats,
combinació/persistència URL, CSV i ZIP/validació antiga. TypeScript, ESLint i
compilació correctes; avís de mida existent. No s’ha executat SQL, provat
interaccions autenticades, escrit dades remotes ni desplegat en aquesta tanda.
Revisió interactiva/visual i totes les comprovacions ajornades continuen pendents.
El servidor local existent respon a http://localhost:5173/Tsumige/ (HTTP 200);
això no acredita les interaccions ni l’estat de sessió al navegador.


## Correcció visual: caselles en lloc del selector

Decisió vigent: No jugat, Vull jugar-hi i No vull jugar-hi són tres caselles.
Les dues últimes es controlen amb un únic estat nul/vull/no_vull; activar una
desactiva l’altra i clicar l’activa la desmarca. El formulari envia intencio_joc
amb un camp ocult: no hi ha selector visible als formularis ni canvis SQL.
Per jugar amb infants queda agrupat amb les marques de fitxa, separat de
Favorit/intercanvi/reproducció/no localitzat, propis de l’exemplar.

El component anterior estava connectat al formulari fora de Configuració i
l’endpoint local el servia. No s’ha acreditat la causa exacta de l’absència
vista per l’usuari: no atribuir-la a memòria cau sense evidència. Prova Chromium
sobre el formulari real amb fixtures sintètiques ara confirma visibilitat i
transicions, teclat i permisos visuals en Col·lecció/log, alta/edició, Clar/Fosc
amb 1440/390 px. No hi ha peticions externes ni escriptures. Captures a /tmp,
cap dependència de navegador afegida al projecte. Les proves manuals reals i
persistència entre dispositius continuen pendents.


## Organització vigent dels filtres

Cerca en una fila pròpia; botons d’etiquetes amb aria-pressed; filtres generals;
Llista/Galeria de Col·lecció a la dreta. No jugat independent i intencions
excloents/desactivables. Favorits/Amb infants mantenen la semàntica existent;
al log s’ofereix Amb infants perquè és de fitxa, però no Favorits d’exemplar.
Cerca i any es recuperen de la URL; la resta de filtres i vista es conserven.
Proves sintètiques SSR/lògica i Chromium 390/768/1440 px Clar/Fosc superades;
cap SQL ni modificació remota. Les comprovacions manuals reals continuen pendents.
