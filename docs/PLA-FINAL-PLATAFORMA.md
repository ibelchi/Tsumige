# Plataforma: comprovació final i procediment d’aplicació

## Estat vigent: conversió aplicada i verificada

El 10 d’octubre de 2026 l’autor ha executat una vegada el script transaccional privat del pla 002. Els informes posteriors rebuts confirmen `coincideix=true`, cap diferència, totes les fitxes resoltes i els recomptes aprovats. Es preserven identificadors, compres, comentaris, valoracions, Bitàcora i propòsits; només els tres digitals aprovats passen a històrics inactius. El ZIP previ, les captures anteriors/posteriors i el material de reversió complet estan verificats i custodiats fora del repositori. La reversió no s’ha executat.

L’usuari confirma que les comprovacions funcionals locals de Plataforma han passat. És una confirmació de l’usuari, no una prova de navegador executada per l’agent ni una verificació de la versió publicada. Continuen pendents les restauracions i recuperacions remotes, els serveis Auth/Storage no comprovats explícitament i la concurrència multiclient. Les restauracions v1/v2 i la inversa acotada estan provades localment amb dades sintètiques.

Les seccions següents conserven l’historial de preparació; les indicacions «pendent», «no aplicat» i «no autoritzat» d’aquelles fases queden substituïdes per aquest estat. **No repetir la migració ni la conversió.** Les propostes de l’auditoria alienes a Plataforma continuen obertes. La publicació del codi s’ha autoritzat separadament.

Preparació local, sense migració remota, conversions ni publicació. Els 453 són **fitxes pendents**, no discrepàncies. Els tres casos físic/digital aprovats no es tornen a decidir. Aquest document no conté noms, compres, IDs o empremtes personals.

## Comprovació final només de lectura

La plantilla pública és [PLATAFORMA-DADES-LECTURA.sql](../supabase/inspection/PLATAFORMA-DADES-LECTURA.sql). Les decisions personals estan emplenades **només en la còpia privada**:

```text
/home/belchi/tsumige-plataforma-privat/COMPROVACIO-NOVA-LECTURA.sql
```

Des de Windows, obrir aquesta ruta a l’Explorador amb Bloc de notes/VS Code:

```text
\\wsl.localhost\Ubuntu-26.04\home\belchi\tsumige-plataforma-privat\COMPROVACIO-NOVA-LECTURA.sql
```

1. Al projecte Tsumigē de Supabase, **SQL Editor → New query**.
2. Enganxar **tot el fitxer privat** i executar amb **Run**, com a `postgres`. És un sol SELECT, sense cridar RPC, canviar context JWT ni modificar dades/permisos.
3. Retorna una cel·la `informe_dades`. Copiar-la completa a JSON o exportar el resultat a CSV. Aquest resultat **és privat**: inclou IDs i compres dels tres casos; la resta de continguts personals es compara mitjançant hashes.
4. Desar fora del repositori, retornar el fitxer o la seva ruta local. La carpeta privada persistent té permisos 0700 i els fitxers 0600; no incorporar-los al repositori.

La consulta identifica el propietari només si les quatre taules tenen un únic propietari. Si hi ha diversos comptes, retorna un bloqueig: cal informar l’UUID correcte privadament al paràmetre `propietari_explicit`, sense triar un compte arbitràriament. La lectura administrativa contrasta els totals globals i de l’àmbit; no assumeix cobertura a partir d’una consulta RLS parcial.

Comprova:

- Totes les fitxes, exemplars actius/retirats, entrades amb/sense any i propòsits. Un únic SELECT comparteix snapshot de lectura; els agregats no depenen del límit de files retornades del SQL Editor.
- Cada cas: un únic joc candidat, exactament **un físic i un digital actius**, compra física igual a l’aprovada i identitat/plataforma coincidents. El nom només localitza candidats al primer informe; es rebutja qualsevol ambigüitat i no es creen vincles. Les recomprovacions utilitzen els IDs del primer pla.
- Vincles, plataformes buides, botigues discrepants, valoracions/notes contradictòries, coincidències, exemplars d’Emulador i formats mixtos no aprovats. Si algun valor o recompte difereix, el pla queda bloquejat; no s’omplen buits ni s’infereix una botiga.
- Empremta completa equivalent a `estat_restauracio`, IDs i hashes abans/després previstos. Els hashes no substitueixen el ZIP de seguretat.

**Estat actual:** nova lectura real rebuda i validada. Cap canvi en totals, IDs, vincles ni hashes de les quatre taules respecte de la referència històrica; confirmats també els IDs físics/digitals i les compres aprovades. La base actual és el nou informe, no una vigència atribuïda a l’anterior. Pla privat persistent a `/home/belchi/tsumige-plataforma-privat/pla-002.json`, amb lectures prèvia/posterior associades i permisos 0600 dins carpeta 0700. Sense errors ni discrepàncies; `autoritza_execucio=false`. Script final generat a `/home/belchi/tsumige-plataforma-privat/APLICA-PLATAFORMA-PLA-002.sql`, provat amb el mateix generador i un pla sintètic sobre l’esquema contrastat. No executar la migració de referència separadament. Cap conversió ni publicació.

## Pla privat per identificadors

Eina local de lectura, que no connecta a Supabase:

```sh
node scripts/plataforma-pla-privat.mjs '/ruta/privada/informe.csv' '/home/belchi/tsumige-plataforma-privat/pla-nou.json'
```

Accepta també JSON. Escriu fora del repositori, amb permisos privats, i no sobreescriu fitxers existents. Conté IDs dels jocs/físics/digitals, compres aprovades, totals abans/després, hashes de totes les files i avisos. **`autoritza_execucio` sempre és false**: un pla preparat no aplica ni autoritza res.

Quan és coherent, prepara dos SELECT privats complementaris:

- `pla-001.json.recomprovacio.sql`: lectura prèvia pels IDs coneguts, conservant els criteris aprovats; detecta també canvis de nom/plataforma.
- `pla-001.json.verificacio.sql`: consulta posterior per comparar totals, IDs i dades amb el resultat previst. És també només lectura i identifica si la base encara és anterior a la migració, si té estructura pendent o fitxes resoltes.

Si es rep una recomprovació:

```sh
node scripts/plataforma-pla-privat.mjs '/ruta/privada/informe-nou.csv' '/home/belchi/tsumige-plataforma-privat/pla-nou.json' '/home/belchi/tsumige-plataforma-privat/pla-001-historic-NO-VIGENT.json'
```

L’eina mostra registres afegits/absents/modificats, recomptes i camps canviats dels tres casos. Preu/any i nom/plataforma/valoració es poden comparar com a valors; notes/comentaris es comparen amb hashes, sense publicar-ne el contingut. Un canvi genera `dades_canviades_revisar` o `bloquejat`: **no es substitueix ni reutilitza cegament el pla anterior**, encara que la compra torni a coincidir. Cal contrastar les diferències abans de validar una nova base.

## Previsions confirmades amb la nova lectura

| Àmbit | Canvi esperat |
| --- | --- |
| Fitxes i IDs | Sense canvi; 453 pendents → 0 |
| Exemplars totals i IDs | Sense canvi |
| Físics actius | Sense canvi |
| Digitals actius / exemplars actius | −3 / −3 |
| Retirats | +3; les compres i notes digitals es conserven |
| Bitàcora i propòsits: totals, IDs, vincles i dades | Sense canvi |

Els totals i identificadors consten exclusivament als fitxers privats. La nova lectura confirma les previsions; els recomptes posteriors no són un resultat de conversió executada. La lectura inclou també entrades sense any i tots els exemplars; no hi ha exclusions del diagnòstic dins les quatre taules comprovades.

## Quan fer el ZIP definitiu

**Després de contrastar el resultat real i validar el pla, immediatament abans de la futura aplicació autoritzada.** Una còpia feta ara pot servir de còpia addicional, però cal repetir-la si hi ha canvis posteriors.

1. Pausar edicions, altes i restauracions del propietari durant la finestra d’aplicació.
2. Descarregar ZIP complet de Configuració i revisar l’informe de portades. Validar que les dades es poden llegir i que l’estat/fingerprint coincideix amb el pla. Desar-lo fora del repositori; tenir també exportació/dump privat d’esquema, RPC, triggers, RLS i dades per poder recuperar estructura i contingut.
3. Tornar a executar la lectura prèvia per IDs. Si qualsevol empremta/camp/recompte ha canviat, aturar, mostrar diferències i renovar pla/ZIP després de contrastar-les.

La descàrrega ZIP és de lectura; no restaura ni canvia dades. Les portades que faltin o no es puguin descarregar s’han de constatar: no es dona la còpia per completa amagant aquests errors.

## Aplicació transaccional futura: no executar ara

La proposta és **un únic script revisat i una única transacció** per a estructura, conversió i assercions. No executar BEGIN/COMMIT en clics separats del SQL Editor: no es pressuposa que mantingui la mateixa sessió.

1. Iniciar transacció SERIALIZABLE amb límits de temps de locks. Com a rol administratiu, bloquejar les quatre taules afectades contra insercions/edicions concurrents, inclosos propòsits. Les operacions externes han de continuar pausades.
2. Abans del primer SELECT/DO que fixi la instantània serialitzable, obtenir els bloquejos. Llegir i comparar amb el pla privat: propietari, empremta completa, tots els IDs/totals i els tres parells per ID amb format, estat actiu i compra física. Cada discrepància ha de provocar una excepció que avorti, abans de tocar dades.
3. Incorporar el cos de la migració estructural preparada dins d’aquesta transacció, **retirant només el BEGIN/COMMIT externs de la còpia d’aplicació**. No tocar el fitxer font ni afegir una transacció niada. Si la columna/RPC ja existeixen, aturar i identificar la fase; no repetir la migració automàticament.
4. Comprovar que afegir `plataforma_resolta=false` no ha modificat cap dada anterior: hashes sense aquest marcador iguals, exemplars/Bitàcora/propòsits íntegres. La columna nova canvia l’empremta completa: calcular-ne una de nova **només després d’aquest contrast**, sense reutilitzar la d’abans ni acceptar-la cegament.
5. Actuar com `authenticated` amb el context del propietari privat, sense concedir permisos nous. Cridar l’executor amb **els tres IDs digitals del pla** i l’empremta nova comprovada. L’esquema/RLS reals i les proteccions continuen actius.
6. Abans de COMMIT, assercions de resultat: tres retirades exactes, totals previstos, totes les fitxes resoltes i canòniques, IDs conservats, físics íntegres, únicament l’estat actiu dels digitals autoritzats canviat. `created_at`, compres, camps buits, booleans, notes/valoracions i tots els vincles preservats; Bitàcora i propòsits iguals fila a fila.
7. Acceptar només `updated_at` dels jocs realment convertits i digitals retirats com a canvi de metadata produït pels triggers existents. Els altres exemplars i totes les entrades mantenen també aquesta metadata. Les assercions han de comprovar aquests límits, no limitar-se a recomptes.
8. COMMIT **només si totes les assercions passen**, en el mateix script. Qualsevol excepció obliga rollback complet d’estructura i dades. El SELECT de verificació preparat serveix també per a lectura posterior; a l’script d’aplicació calen assercions que avortin, no un SELECT amb errors que després faci COMMIT.

El script final privat s’ha emplenat amb els IDs del pla nou i està preparat; **no s’ha executat a Supabase**. Contrasta metadades públiques (columnes/defaults, RPC, triggers, constraints, RLS i permisos de taula), identitats, compres, totals i hashes; qualsevol discrepància avorta la transacció. Les proves completes són sintètiques sobre l’esquema reconstruït. La migració font porta el seu propi COMMIT; **no executar-la separadament si s’opta per aquesta aplicació atòmica**.

## Comprovacions posteriors i recuperació

**Base de dades:** executar el SELECT privat de verificació, confirmar `coincideix=true`, totals/IDs/hashes, tres físics actius i digitals històrics, totes les entrades i propòsits. Custodiar resultat privat i descarregar ZIP v2 posterior. Provar la seva restauració en local amb dades privades únicament si s’autoritza explícitament; les proves d’aquesta tanda segueixen sintètiques.

**Si falla abans de COMMIT:** rollback de tota la transacció; confirmar per lectura que estructura i empremta prèvies es conserven. Si s’havia aplicat estructura en una operació separada anterior, el rollback de la conversió no la desfà: identificar la fase explícitament.

**Si es perd la resposta de COMMIT:** no repetir migració/conversió ni assumir èxit/fallada. Llegir la fase i contrastar amb el pla/verificació abans de decidir. Un estat mixt o cap coincidència exigeix inspecció i no una nova conversió a cegues.

**Si hi ha un problema després de COMMIT:** aturar noves escriptures i guardar una còpia de l’estat actual. La v1 antiga **no pot sobreescriure fitxes resoltes** amb el restaurador ordinari; no s’han d’eliminar proteccions per forçar-ho. Cal un pla de recuperació revisat des del dump/esquema/ZIP previs, assajat localment, que conciliï possibles edicions posteriors i recuperi exactament dades, IDs, vincles i portades. Qualsevol nova operació real de recuperació necessita la seva autorització; aquesta tanda no prepara ni executa un rollback destructiu de producció. Tornar enrere el codi publicat tampoc reverteix les dades.

## Comprovacions pendents fora de la base de dades

- **Auth/PostgREST:** sessió/JWT reals, propietari/convidat/altre compte, errors i invocació de les RPC des de l’aplicació. SQL/RLS locals no acrediten aquestes interaccions remotes.
- **Storage:** serveis d’upload/download, URL signades, MIME/mida, bytes reals i recuperació de portades. RLS i DELETE de metadades estan provats localment, però els interns redactats i les API no estan completament reproduïts.
- **Navegador:** consulta/edició/desament/navegació, llistes/filtres/estadístiques, retirada dels digitals sense perdre Bitàcora, convidats, còpies i restauració; escriptori/mòbil i errors reals.

Controls locals d’aquesta preparació: consulta prèvia en READ ONLY, casos sintètics amb zero/null, retirats/sense any/sense fills, duplicat digital, propietari ambigu, canvis d’empremta i detecció de diferències; verificació posterior del pla amb conversió local i rebuig d’un comentari fora del pla. Esquema públic/RPC/RLS/triggers reconstruïts de l’informe rebut. TypeScript, ESLint i compilació; cap consulta remota executada, conversió real ni publicació.

## Fitxers finals privats i execució futura

Carpeta persistent `/home/belchi/tsumige-plataforma-privat` amb permisos 0700; SQL, informes i manifest 0600.

- `APLICA-PLATAFORMA-PLA-002.sql`: única execució administrativa futura, quan estigui autoritzada. Un BEGIN SERIALIZABLE, locks abans de fixar la instantània, precondicions, migració, conversió com a propietari, assercions i un COMMIT.
- `RECOMPROVA-ABANS-PLA-002.sql`: només lectura, immediatament abans; contrastar el CSV amb el pla. Qualsevol canvi obliga a revisar i renovar pla/script/ZIP.
- `VERIFICA-DESPRES-PLA-002.sql`: només lectura; exigir `coincideix=true`, `fase=fitxes_resoltes`, diferències buides i recomptes previstos.
- `PROCEDIMENT-FINAL-PLA-002.txt`: passos concrets, còpia definitiva, fallada/recuperació i límits. `MANIFEST-SCRIPT-PLA-002.json` vincula pla, migració i script amb SHA-256.

Pausar edicions; descarregar i comprovar ZIP definitiu amb informe de portades, custodiar dump/esquema i dades; recomprovar; executar **tot** el script en una sola execució del SQL Editor com a `postgres` (mai fragments ni BEGIN/COMMIT en clics diferents); verificar i guardar informe/ZIP v2 posterior. Amb error, no continuar fragments ni forçar COMMIT: transacció avortada, ROLLBACK si el client manté sessió. Amb resposta perduda, llegir fase/resultat abans de repetir. No hi ha autorització d’aplicació en aquesta tanda.

Controls: script complet sobre esquema contrastat amb registres sintètics, preservació fila a fila incloent null/zero/false/espais, rollback de dades i DDL per compres/comentaris/IDs/propòsits/RLS canviats, convidat/anònim i fallada injectada després de convertir. Verificació posterior completa i reexecució rebutjada; permisos de consulta/edició/execució comprovats localment. Regressions de migració/restauració v1/v2 i RPC/RLS/timestamps/Storage local superades. TypeScript, ESLint i build superats (avís de mida de bundle existent). PGlite no acredita concurrència multiclient ni API remotes; Auth/PostgREST, Storage real i navegador continuen pendents.

Reproducció local (metadades privades com a entrada, dades sempre sintètiques):

```sh
node supabase/tests/local/transaction.mjs /ruta/privada/informe-esquema.csv
```

Requereix PGlite 0.5.8 fora del repositori; es pot indicar `TSUMIGE_PGLITE_MODULE` si és en una altra ruta. Cap informe ni identificador personal s’ha d’incorporar al repositori.

## Recuperació: límit de la còpia actual i complement d’esquema

L’informe privat inicial és suficient per reproduir les proves de l’esquema públic, però **no és una còpia de recuperació completa ni un dump executable**. Noms de restriccions/índexs/triggers, ACL i part dels interns de Storage van quedar redactats; no es poden reconstruir fidelment a partir d’aquell CSV. Els rols/API gestionats, Auth i bytes de Storage tampoc es recuperen amb metadades.

Consulta complementària només de lectura: [PLATAFORMA-RECUPERACIO-ESQUEMA-LECTURA.sql](../supabase/inspection/PLATAFORMA-RECUPERACIO-ESQUEMA-LECTURA.sql), també copiada a la carpeta privada persistent. Conserva noms tècnics i ACL, afegeix signatures qualificades i extensions, i manté l’omissió explícita de cossos amb indicis de secrets. No consulta dades de comptes, convidats o fitxers. Executar-la completa al SQL Editor com a `postgres`; exportar la cel·la `informe_esquema` completa a JSON o el resultat complet a CSV, fora del repositori. Retornar la ruta privada per contrastar definicions i omissions abans d’aplicar.

El complement no substitueix ZIP/dades/portades ni un dump d’esquema i contingut apte per restaurar. Cal custodiar la còpia definitiva i assajar la recuperació estructural amb dades sintètiques; un CSV de metadades més un ZIP no equivalen per si sols a recuperació integral provada. La recuperació ordinària d’una v1 sobre fitxes resoltes continua bloquejada: no forçar-la. No reconstruir els esquemes gestionats Auth/Storage com si fossin taules d’aplicació.

Defecte corregit en el generador: les signatures de funcions públiques de l’informe inicial poden arribar sense `public.`. Ara s’identifiquen també aquestes signatures i es qualifiquen; una RPC modificada provoca rollback en la prova completa. El script privat es regenera amb el generador corregit i el manifest corresponent, sense aplicar-lo. Quan arribi el complement real, contrastar-lo abans de donar la recuperació per preparada.

## Complement de recuperació rebut i contrastat

Informe privat copiat a la carpeta persistent en CSV i JSON, amb permisos 0600, validació i SHA-256 de la font. Cap cos omès ni objecte absent dins l’àmbit consultat: noms tècnics, ACL i cossos Storage abans redactats recuperats. Columnes/defaults, constraints/índexs, RPC, triggers, RLS, permisos i bucket coincideixen amb l’informe anterior normalitzant les redaccions; no s’han detectat canvis de definicions. Les RPC de Plataforma absents són esperables abans de migrar.

Provada novament la transacció completa amb l’esquema d’aquest informe i dades sintètiques: conversió, verificació fila a fila, permisos, reexecució rebutjada i rollback de DDL/dades davant compres/comentaris/IDs/propòsits/RPC/RLS canviats o fallada després de convertir.

**Permet** reconstruir i assajar les cinc taules d’aplicació i les RPC/triggers/RLS relacionats, i conservar les metadades capturades de Storage/Auth/bucket. **No acredita** un dump restaurable o una recuperació integral: no conté files personals, comptes Auth, assignacions de convidats o bytes de portades; no cobreix tots els objectes dels serveis gestionats. Les proves continuen amb suport Auth/Storage mínim local, sense restauració integral des d’un dump.

**Encara falta:** ZIP definitiu complet amb dades/portades i informe d’errors revisat; còpia restaurable d’esquema/dades adequada al procediment documentat (també assignacions d’accés si cal reconstruir-les), integritat i assaig en entorn aïllat. El CSV/JSON no substitueix aquest material ni autoritza forçar una restauració v1 sobre dades resoltes. No hi ha una altra omissió concreta de definició detectada en l’àmbit capturat; no es dona per cobert tot Supabase. Auth/PostgREST, Storage real i navegador continuen pendents. Cap aplicació remota ni publicació.

## Recuperació acotada als canvis del pla 002

Aquest procediment alternatiu cobreix la reversió del pla en **la mateixa base existent**, amb escriptures pausades; no la reconstrucció d’un projecte Supabase perdut. Per a aquest àmbit no cal copiar ni restaurar comptes Auth, assignacions de convidats o bytes de Storage, perquè el script no els modifica. Les còpies globals són una protecció addicional davant causes externes, no un requisit derivat d’aquesta conversió.

| Component | Efecte real del script | Recuperació acotada |
| --- | --- | --- |
| `fitxes_joc` | Afegeix `plataforma_resolta`, canvia default; resol totes les fitxes, normalitza només plataformes i actualitza `updated_at` | Elimina marcador i restaura plataforma/data originals per ID |
| Tres digitals aprovats | `a_la_colleccio=false` i `updated_at`; sense DELETE | Recupera actiu/data originals; compres i altres camps romanen intactes |
| RPC i triggers | Dos triggers i vuit funcions amb noms nous; RPC original de restauració renomenada i wrapper nou al nom original; grants als nous objectes | DROP dels nous amb RESTRICT, sense CASCADE; rename de la RPC original, preservant OID/cos/owner/ACL |
| Bitàcora, propòsits i altres exemplars | Locks/lectura, sense actualitzacions | Comprovació de hashes íntegres, cap reimportació |
| Auth i convidats | Context JWT només local a la transacció; lectura/lock de convidats, sense canviar comptes o assignacions | Cap restauració ni exportació d’aquests registres |
| Storage | Cap operació sobre bucket, polítiques, objectes, rutes o bytes | Cap restauració de Storage |

**Materials privats persistents:** `CAPTURA-VALORS-ABANS-PLA-002.sql`, `CAPTURA-ESTAT-DESPRES-PLA-002.sql`, `RECUPERACIO-ACOTADA-PLA-002.txt`, manifest vinculat al SHA-256 del script d’aplicació i còpia autocontinguda d’eines de reversió. Carpeta 0700, fitxers 0600. No s’inclouen valors reals als documents públics.

**Falta una exportació real mínima abans:** executar el SELECT `CAPTURA-VALORS-ABANS-PLA-002.sql` al SQL Editor com a `postgres`, desar el resultat complet privat i retornar la ruta. Captura només ID/plataforma/updated_at de les fitxes i ID/actiu/updated_at dels tres digitals, més empremtes. Exigeix coincidència amb el pla; els informes anteriors contenen hashes, però no els valors originals necessaris. Sense aquest resultat verificat no es dona per custodiada la recuperació real.

Mantenir escriptures pausades; còpia ZIP definitiva addicional i recomprovació immediata per IDs abans de qualsevol aplicació autoritzada. Després d’un futur COMMIT confirmat, executar la captura posterior de lectura i custodiar-la: exigeix resultat semàntic correcte i registra hashes complets (timestamps inclosos) de dades/esquema. No renovar cegament aquesta base posterior per saltar-se edicions noves.

La reversió es genera amb captures verificades anteriors/posteriors: una transacció SERIALIZABLE amb locks abans de llegir; exigeix exactament l’estat posterior capturat. Recupera únicament els camps canviats, retirant el marcador i restituint la RPC original; desactiva temporalment només els dos triggers de timestamps per recuperar dates exactes i els torna al seu estat original. No desactiva RLS ni els triggers de valoració/portada. Compara totes les files de les quatre taules i l’esquema lògic, índexs, triggers, funcions, ACL i RLS amb l’estat original abans del COMMIT. Dependències noves o qualsevol discrepància fan rollback de la reversió. No força una restauració v1. Una edició posterior necessita conciliació i autorització nova, no una sobreescriptura automàtica.

**Prova local superada:** aplicar → capturar estat posterior → revertir, amb l’esquema contrastat i dades sintètiques; hashes inicials íntegres, timestamps, zero/null/espais/false, IDs/vincles, Bitàcora, propòsits, ACL/RLS i OID de l’RPC original exactes. També rollback d’una reversió amb valors originals incorrectes, rebuig d’edicions posteriors i d’accés anònim. Auth/convidats/metadades Storage ficticis intactes tant en aplicar com en recuperar; això no acredita les API o els bytes remots.

Reproducció: `node supabase/tests/local/recovery.mjs /ruta/privada/esquema-recuperacio.json`. El ZIP/informe d’esquema per si sols continuen sense equivaler a recuperació validada; el que s’ha provat és aquesta inversa limitada. Cap migració ni reversió remota executada; no s’ha publicat.

## Valors originals reals rebuts: material previ de reversió completat

Captura real desada privadament en CSV/JSON, permisos 0600. Validats format/estat, totes les 453 fitxes sense IDs duplicats/absents i els tres digitals exactes actius. Empremta de dades igual al pla 002; empremta d’esquema recalculada independentment a partir del complement de metadades i coincident. Plataformes/timestamps dels tres casos contrastats també amb hashes per camp; formats dels camps anteriors validats sense simular la migració amb dades personals.

`BUNDLE-REVERSIO-PLA-002.json` custodia pla, valors originals reals, esquema i hashes d’eines/script. `VALIDACIO-VALORS-ABANS-PLA-002.json` vincula els fitxers amb SHA-256 i registra l’abast de validació. `ESTAT-REVERSIO-PLA-002-ORIGINALS.txt` actualitza el procediment privat. Les eines persistents coincideixen amb les provades localment. El material anterior per a la inversa acotada ja està complet; cap canvi remot.

**Ara es pot passar a preparar el ZIP definitiu**, pausant escriptures i comprovant dades, portades i informe d’errors. Fer tot seguit la recomprovació immediata per IDs i contrastar-la amb pla/captura; qualsevol canvi exigeix revisar i renovar el material. La captura només acredita l’estat observat, no garanteix que es mantingui fins a l’aplicació. L’autorització d’aplicació continua pendent.

El SQL de reversió real no es genera amb empremtes posteriors inventades: després d’una futura aplicació confirmada, amb escriptures pausades, cal la captura posterior íntegra i validada per vincular-lo a l’estat real. Aquest pas futur no és una còpia d’originals pendent abans d’aplicar. La reversió continua necessitant autorització i rebutja qualsevol edició posterior. El bundle no es declara dump global ni recuperació completa del projecte; només custòdia per a la inversa acotada provada.
