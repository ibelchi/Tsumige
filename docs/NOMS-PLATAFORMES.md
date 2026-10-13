# Noms de plataforma aprovats i tanda conjunta

## Estat vigent: aplicat i validat

Tanda conjunta d’altes i noms aplicada una vegada per l’usuari amb el script compacte privat. Rebut post-COMMIT contrastat semànticament, inclosos decimals: `verificat=true`, cap diferència imprevista, 123 fitxes normalitzades, IDs/vincles/dades històriques preservats i RPC/permisos correctes. Recuperació exacta retornada validada i custodiada fora del repositori, sense executar-la. No repetir cap migració ni reversió per publicar el client.

Les proves manuals d’altes noves continuen ajornades perquè l’usuari no té registres reals per incorporar; no bloquegen aquesta publicació ni es donen per superades. Queden pendents la verificació visual de les darreres galeries/detall i les interaccions autenticades, Auth/Storage API i concurrència real. El procediment de preparació que segueix és històric; l’aplicació ja està completada.


## Decisions confirmades

| Àlies antic | Nom canònic exacte |
|---|---|
| GB | Game Boy |
| GBA | Game Boy Advance |
| N64 | Nintendo 64 |
| NDS | Nintendo DS |
| NES | NES |
| SNES | Super Nintendo |
| MD | Mega Drive |
| XBOX360 | Xbox 360 |
| PS4 | PlayStation 4 |
| Famicom | Famicom |
| MSX | MSX |
| Xbox / XBOX | XBOX |

XBOX és la primera consola Xbox. No es fusiona amb Xbox 360, Xbox One o altres consoles. Famicom i NES, Nintendo DS i Nintendo 3DS continuen separades. No s’infereix cap plataforma pel títol ni es converteix Genesis, MSX2 o una altra denominació no acordada.

Client i SQL generat comparteixen `src/lib/platform-names.json`, amb els noms anteriors i els àlies ja confirmats de Steam/Epic Games/itch.io/PC/Emulador. Opcions, suggeriments, detalls, filtres, estadístiques i CSV utilitzen el nom canònic, sense opcions duplicades. Els ZIP nous preserven els noms normalitzats actuals; la lectura v1/v2 accepta els àlies antics aprovats, mantenint IDs i vincles. No es relaxen les proteccions prèvies sobre botigues, Emulador o físic/digital.

El visor «Dades originals de l’Excel» s’ha retirat de la interfície. `origen`, `notes` i altres camps interns continuen als tipus, dades, còpies i restauració. No es netegen registres.

## Una sola tanda: noms i RPC d’alta

La preparació nova substitueix l’aplicació separada de Game Boy i RPC. Els fitxers històrics/preparats es conserven com a referència, però **no s’han d’executar successivament ni fer un push global de migracions**.

- Normalització ampliada: `supabase/migrations/202610130001_noms_plataformes.sql`.
- RPC d’alta atòmica: `supabase/migrations/202610110001_altes_atomiques.sql`.
- Generador conjunt: `scripts/altes-noms.mjs` i CLI `scripts/altes-noms-cli.mjs`.
- `supabase/releases/ALTES-NOMS-PLANTILLA-NO-EXECUTAR.sql` permet revisar el canvi conjunt, però té un bloqueig explícit: no és el fitxer per aplicar dades reals.

Només es modifiquen la plataforma i els timestamps dels jocs que canvien de nom, la definició de `normalitza_plataforma` i dues RPC noves amb permisos authenticated/propietari. Es mantenen IDs, compres, valoracions, comentaris, exemplars actius/històrics, log, propòsits i assignacions de convidats. Cap conversió de format, retirada d’exemplar, fusió o restricció global nova. Auth i fitxers de Storage no es modifiquen.

### Conflictes que cal comprovar

1. Dos o més IDs del mateix propietari/títol acaben a la mateixa plataforma canònica i alguna plataforma canvia. La tanda falla abans de convertir o crear RPC; cal revisar les dades dels IDs implicats, sense escollir-ne un automàticament.
2. Entrades anuals repetides, entrades sense any, diversos exemplars actius o fitxes antigues no resoltes. La captura n’inclou els recomptes i totes les files: es preserven i no s’imposen restriccions incompatibles. La nova alta ofereix selecció explícita quan hi ha duplicats antics i rebutja fitxes no resoltes.
3. Esquema, RLS, propietaris/ACL, permisos o files canviats entre captura i aplicació. Les guardes avorten; no regenerar el pla a cegues ni forçar l’execució.
4. RPC d’alta ja presents o aplicació repetida. No es sobreescriuen: el CREATE falla i la transacció es desfà.

Captura conjunta actual rebuda i validada el 2026-10-13: cap col·lisió de normalització, cap vincle orfe ni grup joc/any repetit; esquema sense omissions dins de l’àmbit. Pla i script reals custodiats fora del repositori. Els diagnòstics i empremtes anteriors no s’han reutilitzat com si fossin actuals.

## Captura inicial conjunta (pas completat)

Obrir **`supabase/inspection/ALTES-NOMS-CAPTURA-LECTURA.sql`**, copiar-lo sencer a **SQL Editor → New query**, executar-lo amb el rol **postgres** i exportar l’únic resultat com a **CSV**, per exemple `altes-noms-abans.csv`. És un únic SELECT només de lectura, provat en READ ONLY.

La captura agrupa l’esquema contrastable, definicions i ACL, RLS/permisos, les files de les cinc taules d’aplicació, diagnòstic d’altes i col·lisions de noms. És **privada**: conté comentaris/identificadors/dades personals necessaris per contrastar i recuperar. Desar a Descàrregues i retornar només la ruta, sense enganxar-ne el contingut ni incorporar-la al repositori. No conté credencials i no llegeix comptes Auth ni bytes/objectes de Storage.

Aquesta captura substitueix les exportacions separades d’esquema, Game Boy i altes. No cal repetir els informes del pla 002.

## Procediment mínim agrupat (substitueix el circuit anterior)

**Tres intervencions manuals en el camí correcte, sense conflictes:**

1. **Captura inicial conjunta.** Executar una vegada `supabase/inspection/ALTES-NOMS-CAPTURA-LECTURA.sql` com a postgres al SQL Editor i exportar el resultat CSV. Retornar-ne només la ruta. Aquesta és l’única consulta manual de diagnòstic. Les captures anteriors continuen servint com a esquema de referència, però no demostren l’estat actual, les col·lisions dels noms aprovats ni els valors originals que cal recuperar. No cal tornar a exportar per separat esquema, noms, altes, Auth o Storage.
2. **ZIP definitiu.** Quan la captura s’hagi validat i les proves locals amb les seves metadades hagin passat, pausar les edicions, descarregar el ZIP des de l’aplicació i retornar-ne la ruta per comprovar integritat/dades/portades/errors. Mantenir les edicions pausades fins al resultat. El ZIP complementa el bundle, no substitueix la recuperació de funcions, ACL i timestamps.
3. **Aplicació única, quan s’autoritzi.** Executar sencer `APLICA-ALTES-NOMS.sql` privat, una vegada, i exportar **el resultat d’aquest mateix batch** com a `altes-noms-resultat.csv`. No hi ha una consulta posterior separada: el batch valida, aplica i comprova dins de la transacció; conserva una captura posterior en una taula temporal de sessió i retorna, després del COMMIT, `verificat`, les dades/esquema posteriors i `reversio_sql`. Desar aquest resultat privat i retornar-ne la ruta. Es tracta d’una execució amb desament del seu rebut, no d’una segona captura manual.

Entre les intervencions 1 i 2, la preparació es fa localment: contrastar definicions, detectar col·lisions per IDs, repetir les proves amb dades sintètiques, preparar totals abans/després i generar el pla privat, aplicació i recuperació. No executar conversions amb conflictes ni sobreescriure plans automàticament. `node scripts/altes-noms-cli.mjs prepara /ruta/altes-noms-abans.csv /home/belchi/tsumige-plataforma-privat` genera els materials fora del repositori (carpeta 0700, fitxers 0600, sense sobreescriure). Amb el rebut, el CLI pot validar-lo independentment i extreure la reversió amb el mode `reverteix`; això és treball local, sense cap exportació nova a Supabase.

No s’exigeix una recomprovació manual abans d’aplicar: el script SERIALIZABLE bloqueja les cinc taules i compara dades completes, IDs, esquema, RLS i ACL abans de modificar res. Si ha canviat alguna cosa, avorta sense canvis parcials. Un conflicte real requereix revisar-lo i, si escau, un pla nou; no és una exportació rutinària afegida al procediment. Cap script d’aquesta tanda torna a aplicar el pla 002 ni retira exemplars.

El resultat posterior es calcula mentre encara es mantenen els locks; es retorna només després del COMMIT i no introdueix cap taula persistent. Inclou la reversió amb els timestamps realment generats. La reversió compara dades i metadades amb aquest estat abans de restaurar originals. La prova local cobreix el batch complet i la reversió que retorna. La presentació/exportació del resultat multisentència al SQL Editor real encara no s’ha provat: cal conservar el resultat final íntegre. Si es perd la resposta després del COMMIT, no repetir l’aplicació: cal aclarir l’estat mitjançant una lectura excepcional, i aquesta incidència pot necessitar una intervenció addicional.

Després: comprovacions funcionals de client nou, consulta, filtres, convidats i altes; no formen part de les exportacions SQL. Les altes dels clients antics i les escriptures directes no comparteixen els locks de la nova RPC; mantenir-les pausades durant la tanda. Les edicions posteriors invaliden la reversió exacta i s’han de conciliar, mai sobreescriure-les.

## Opció futura: gestionar Supabase des d’Ubuntu

No hi ha eines Supabase del connector disponibles en aquesta sessió, ni executables `psql` o `supabase` disponibles en la comprovació actual. No s’ha instal·lat ni configurat cap accés.

Es proposa una configuració inicial guiada de **psql**, suficient per executar aquest SQL, capturar-ne el resultat i desar el bundle privat automàticament. Obtenir paràmetres i certificat a Connect del projecte; utilitzar connexió directa o **Session pooler** si cal IPv4, amb verificació TLS. Introduir la contrasenya exclusivament en una entrada local segura; si es vol automatització posterior, desar-la en un fitxer de contrasenyes amb permisos 0600 fora del repositori, sense mostrar-la a la conversa ni posar-la als arguments/logs. [Connexió psql oficial](https://supabase.com/docs/guides/database/psql), [connexions i poolers](https://supabase.com/docs/guides/database/connecting-to-postgres).

Amb l’accés autoritzat/configurat es podrien automatitzar captura, contrast, proves, guardes, aplicació autoritzada i desament del rebut/reversió. No cal fer `supabase db push`: podria incloure migracions històriques que no s’han de repetir. El CLI Supabase és opcional per altres tasques; no és necessari per aquest batch.

L’accés SQL exigeix connectivitat i privilegis de base de dades suficients, inclòs TEMP; no substitueix una sessió de propietari/convidat al navegador ni comprova les API d’Auth/Storage o els bytes de portades. Les captures inicials es poden executar READ ONLY, però aplicar requereix autorització d’escriptura. Aquesta connexió i el funcionament remot no s’han provat. Després de la configuració inicial, les exportacions SQL manuals podrien ser **zero**; encara caldria la còpia ZIP i l’autorització d’aplicació, més les comprovacions funcionals. No es configura res ara.

## Recuperació i límits

- Error abans de COMMIT: rollback íntegre de la mateixa transacció. Amb resposta perduda, consultar estat; no repetir a cegues.
- Error descobert després de COMMIT: reversió específica que exigeix dades/esquema/ACL iguals a la captura posterior, elimina només les dues RPC noves amb RESTRICT, recupera la definició original de normalització mitjançant CREATE OR REPLACE (mateix OID/propietari/ACL), restaura plataforma/updated_at originals per IDs i comprova dades/esquema/ACL originals abans de COMMIT.
- Per recuperar exactament els noms i timestamps es desactiven temporalment només els triggers de validació de plataforma i updated_at de fitxes, restituint-ne els estats originals. RLS i la resta de triggers no es desactiven. Tot és transaccional.
- Un ZIP no és una recuperació d’esquema. El bundle antic del pla 002 continua custodiat, però no substitueix el nou ni s’executa per desfer aquesta tanda.
- Recuperació acotada en una base existent; no és un dump d’un projecte destruït ni recuperació d’Auth/Storage perduts per causes externes.

## Validació i confirmació visual

L’usuari ha confirmat satisfactòriament els canvis visuals de la tanda anterior: Inici/selecció aleatòria, Galeria, enllaços i neteja. Aquesta confirmació no equival a provar el desament dels formularis amb una RPC que encara no està aplicada.

Proves locals amb esquema contrastat i dades sintètiques: noms exactes i plataformes separades, altes atòmiques, duplicats, idempotència, rollback, permisos propietari/convidat/anònim, còpies v1/v2, preservació de dades i origen intern. Tanda conjunta provada: captura READ ONLY, dades desactualitzades, col·lisions i fallada després del DDL rebutjades amb rollback; aplicar/revertir recupera dades originals, i ACL posteriors alterades bloquegen la reversió.

Reproducció: `node supabase/tests/local/altes-noms.mjs /ruta/esquema-recuperacio.json-o-captura.csv` i `node supabase/tests/local/creation.mjs /ruta/esquema-recuperacio.json`, amb PGlite fora del repositori. Les captures es fan localment amb registres sintètics; els inputs reals només proporcionen metadades, no s’importen com a registres de prova.

Captura actual i preparació completades: 123 fitxes per normalitzar, sense col·lisions. Es mantenen 453 fitxes, 440 exemplars (437 actius: 218 físics i 219 digitals; 3 històrics), 202 entrades de log i 4 propòsits. Es preserven 122 entrades sense any i el cas amb múltiples exemplars físics; no se’n dedueix cap consolidació. Els tres casos del pla 002 contrastats per IDs continuen resolts. Proves locals repetides amb les metadades actuals i dades sintètiques; pla privat persistent i aplicació única amb resultat/reversió preparats. **Pendents només del circuit d’aplicació: ZIP definitiu verificat i autorització/execució única amb desament del rebut.** El batch ja retorna la captura posterior i la reversió; no cal una consulta manual addicional després del COMMIT. Auth/PostgREST/Storage reals no verificats. Tres columnes de la Galeria continuen sent només proposta pendent.

## Rebut temporal, permisos i avisos del SQL Editor

- `tsumige_altes_noms_receipt` és `CREATE TEMPORARY TABLE ... ON COMMIT PRESERVE ROWS`, dins del `pg_temp_N` de la connexió PostgreSQL. Una única columna `bundle jsonb` conté dades posteriors, metadades i la inversa SQL amb originals: material privat. No es crea cap taula permanent ni cap endpoint public nou. Es conserva després del COMMIT per retornar el rebut; s’elimina quan acaba la sessió PostgreSQL, no necessàriament quan es tanca la pestanya si el servidor manté una connexió al pool. [Taules temporals PostgreSQL](https://www.postgresql.org/docs/current/sql-createtable.html).
- Reforç explícit: revocar tots els privilegis de la taula a PUBLIC, anon, authenticated i service_role; comprovar persistència temporal/esquema de la sessió/propietari, ACL de taula i columnes i permisos efectius. Qualsevol concessió a tercers, inclosa herència o una concessió de columna, provoca error abans del COMMIT i rollback de la tanda. No canvien permisos/RLS de les taules d’aplicació.
- Proves locals: tant els rols API com un rol que només rep privilegis de PUBLIC tenen lectura denegada fins i tot a la mateixa connexió. Simulació de defaults globals permissius, concessió inesperada de taula/columna, rollback íntegre, resultat post-COMMIT, restauració v1/v2 i recuperació exacta superats. L’aïllament entre connexions és una propietat de les taules temporals; no s’ha fet cap petició a l’API real.
- Si apareix el diàleg RLS, escollir **Run without RLS** amb el script revisat: manté exactament el batch provat, sense afegir SQL després del SELECT final/COMMIT. No desactiva RLS de taules existents. **Run and enable RLS** afegeix ordres automàtiques, innecessàries per aquest rebut temporal amb permisos només del propietari. [Implementació del diàleg a Supabase](https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/SQLEditor/SQLEditor.utils.ts).
- Revisió de l’avís de destrucció: cap DROP/DELETE/TRUNCATE executable al batch principal. Els DROP FUNCTION de les dues RPC noves són text de la futura inversa, sense executar durant l’aplicació; també es desen definicions històriques de restauració amb SQL de substitució. El detector textual pot trobar aquestes instruccions dins de literals. Només s’executa UPDATE de plataformes amb WHERE, CREATE OR REPLACE de normalització, CREATE de dues RPC i el rebut temporal amb revocacions/guardes; no es descarta cap registre. La recuperació, autoritzada separadament, elimina únicament les dues RPC noves amb RESTRICT i restaura els originals. [Detecció d’avisos](https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/SQLEditor/SQLEditor.constants.ts).
- Versió privada revisada separada; conservar el pla/captura/ZIP originals. La revisió canvia només la protecció i diagnòstic del rebut, no les decisions, IDs ni valors a convertir. Cap exportació addicional ni canvi a Supabase; les guardes ja cobreixen la recomprovació inicial.
# Script compactat per al SQL Editor

La versió privada `APLICA-ALTES-NOMS-COMPACTE.sql` substitueix la recomanació de la versió revisada rebutjada per mida. El generador `scripts/altes-noms-compact.mjs` reutilitza les mateixes guardes i dades inicials: les comparacions continuen essent completes, sense substituir-les per empremtes. Només elimina còpies literals repetides. La captura es carrega una vegada en una taula temporal amb permisos exclusius del propietari de la sessió, comprovats abans de carregar dades; desapareix al COMMIT. El rebut temporal final conserva les proteccions de la versió revisada.

Abans d’una nova aplicació, executar només la consulta privada `COMPROVA-INTENT-REBUTJAT.sql` i conservar el resultat. Cal que dades i esquema coincideixin amb la captura vigent i que les RPC noves siguin absents. Si qualsevol resultat difereix, aturar-se sense regenerar el pla automàticament. Aquest diagnòstic usa empremtes; el script d’aplicació conserva les comprovacions exactes de tots els valors.

El rebuig de mida es produeix abans de la petició al servidor en el [codi oficial del SQL Editor](https://github.com/supabase/supabase/blob/master/apps/studio/data/sql/execute-sql-mutation.ts). No substitueix una comprovació de l’estat real. La versió compactada ocupa 910.373 bytes i queda per sota de la guarda de mida actual. Si apareix el diàleg RLS, escollir «Run without RLS»: les dues taules són temporals i els permisos es restringeixen explícitament; no afegir instruccions després del COMMIT i del resultat final.

Conservar íntegrament `bundle_altes_noms` retornat després del COMMIT, que conté verificació, captura posterior i SQL de reversió. La reversió tampoc s’executa automàticament. Aplicació remota encara no executada; no s’ha configurat cap accés directe nou.
