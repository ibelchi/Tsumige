# Plataforma única: criteris confirmats i preparació

## Estat vigent: conversió aplicada i verificada

El 10 d’octubre de 2026 l’autor ha executat una vegada el script transaccional privat del pla 002. Els informes posteriors rebuts confirmen `coincideix=true`, cap diferència, totes les fitxes resoltes i els recomptes aprovats. Es preserven identificadors, compres, comentaris, valoracions, Bitàcora i propòsits; només els tres digitals aprovats passen a històrics inactius. El ZIP previ, les captures anteriors/posteriors i el material de reversió complet estan verificats i custodiats fora del repositori. La reversió no s’ha executat.

L’usuari confirma que les comprovacions funcionals locals de Plataforma han passat. És una confirmació de l’usuari, no una prova de navegador executada per l’agent ni una verificació de la versió publicada. Continuen pendents les restauracions i recuperacions remotes, els serveis Auth/Storage no comprovats explícitament i la concurrència multiclient. Les restauracions v1/v2 i la inversa acotada estan provades localment amb dades sintètiques.

Les seccions següents conserven l’historial de preparació; les indicacions «pendent», «no aplicat» i «no autoritzat» d’aquelles fases queden substituïdes per aquest estat. **No repetir la migració ni la conversió.** Les propostes de l’auditoria alienes a Plataforma continuen obertes. La publicació del codi s’ha autoritzat separadament.

Actualització del 10 d’octubre de 2026. Aquest document substitueix la proposta anterior de tipus interns i plataformes pròpies d’exemplar/entrada, descartada per l’autor. Codi i SQL preparats localment; cap migració aplicada, registre convertit ni publicació. Exemples exclusivament sintètics.

## Decisions confirmades

- Un únic camp visible **Plataforma** sota el nom del joc. Steam, Epic Games, itch.io, PC, Nintendo Switch, PS4 i Emulador són opcions al mateix nivell, sense tipus intern.
- Plataformes diferents impliquen registres de joc diferents. Cada fitxa conserva la seva valoració, comentaris i entrades anuals. No es fusionen registres pel títol.
- Mateix joc físic i digital a la mateixa consola: només compta l’exemplar físic. Abans de consolidar dades existents es presenten discrepàncies de valoració, comentaris i compra. Bitàcora es preserva.
- Digitals de PC adquirits a Steam, Epic Games o itch.io utilitzen aquesta botiga com a Plataforma. PC queda per a instal·lació directa o edició física de PC.
- Emulador només admet entrades de Bitàcora, sense exemplars ni recompte físic/digital de Col·lecció. Diverses entrades anuals poden apuntar al mateix joc.
- Noves plataformes mitjançant un camp de text amb suggeriments, sense modificar codi ni indicar tipus. Epic, Epic Games i Epic Games Store es normalitzen com **Epic Games**.
- Botiga o servei desapareix de la interfície dels registres amb conversió resolta. Els valors originals es conserven per a compatibilitat i diagnòstic.
- Filtres i estadístiques empren la plataforma de cada fitxa; Steam/Epic/itch.io no s’agrupen sota PC. Còpies antigues continuen llegibles.

## Esquema i combinacions: abast real de la revisió

El client declara `fitxes_joc.plataforma`, `exemplars.botiga_servei` i relacions `joc_id` d’exemplars/experiències. Una experiència no identifica cap exemplar. S’han revisat formularis, consulta, alta, filtres, resum d’Inici, estadístiques, CSV, ZIP, validació i SQL de restauració, amb l’inventari de [l’auditoria](AUDITORIA-DETALL.md).

**No s’han consultat l’esquema ni les combinacions reals de Supabase.** No hi ha una eina de connexió d’inspecció del projecte en aquesta sessió ni `psql`/CLI Supabase disponibles. Les proves PostgreSQL locals posteriors utilitzen PGlite, sense accés al servidor real. El repositori no inclou les definicions originals de `crear_registre`, `desar_registre`, restriccions i triggers. No s’han utilitzat credencials ni llegit còpies privades.

Preparada [inspection/plataforma.sql](../supabase/inspection/plataforma.sql), només lectura: columnes, restriccions, RLS, definicions de RPC/triggers i combinacions agregades del propietari. **No executada.** Els resultats SQL s’han de contrastar abans d’aplicar la migració preparada i no s’han de publicar sense revisar.

Configuració incorpora **Conversió de Plataforma: discrepàncies**, només propietari i sense botó de conversió. Quan l’usuari l’obre, utilitza la lectura paginada existent per presentar els grups següents, amb IDs, notes/valoracions i compres per contrastar dins de la sessió privada. No s’han carregat aquestes dades durant les proves.

| Grup | Què requereix revisar |
| --- | --- |
| Conversió pendent | Registres antics encara no confirmats per al model únic. No és una marca de revisió d’importació de l’Excel. |
| Plataforma i botiga | Valors diferents; un venedor físic no determina una plataforma. Diverses botigues poden requerir separar fitxes. |
| Destí de Bitàcora | Entrades del joc original quan els exemplars proposen altres plataformes. No atribuir-les a una botiga per possessió actual. |
| Físic i digital | Exemplars actius dels dos formats; revisar quin físic es conserva si n’hi ha diversos i què deixa de comptar. |
| Dades de compra | Diferències en any, preu, botiga o notes dels formats; zero euros és informat. |
| Valoracions | Valoració compartida i valoracions antigues d’entrades diferents. |
| Comentaris | Comentari compartit i notes antigues diferents. Cap unificació/descarte automàtic. |
| Emulador amb exemplars | Cal resoldre la conservació d’exemplars històrics fora de Col·lecció, sense inventar entrades anuals. |
| Coincidències | Fitxes amb nom/plataforma normalitzats iguals o un possible destí de botiga ja existent. Es presenten com a coincidències, mai com a vinculacions automàtiques. |

El diagnòstic analitza també retirats i notes antigues. La coincidència textual només genera un avís. El diagnòstic comunicat posteriorment per l’autor i la cobertura reforçada es documenten al final; no equivalen a una inspecció SQL real feta en aquesta sessió.

## Model preparat i transició segura

Es manté Plataforma com a text de la fitxa, sense catàleg de tipus ni excepcions per exemplar/entrada. Les opcions noves es poden escriure directament; el datalist ofereix noms coneguts i els existents. No s’afegeix cap relació nova Bitàcora→exemplar.

Preparat un camp tècnic opcional del client, `plataforma_resolta`, que la migració afegiria com a booleà. No classifica plataformes. Els registres preexistents continuarien false; els nous serien true. Afegir-lo **no converteix** cap valor ni retira cap exemplar.

- Sense migració, el client conserva compatibilitat amb els RPC actuals. Els registres antics mostren Botiga o servei i conserven el valor en desar. No es presenta tota la base com a convertida.
- Amb model preparat disponible, les altes noves utilitzen RPC específics. Els registres resolts mostren/editen només Plataforma i preserven la botiga original com a dada històrica fora del formulari.
- No es pot canviar la plataforma d’un joc amb registres vinculats per convertir-lo en un altre des del formulari ordinari. Una plataforma diferent necessita una fitxa diferent i una revisió explícita dels vincles. Es poden afegir entrades al joc antic sense inventar-ne la botiga; afegir exemplars a un joc pendent demana resoldre’n la conversió quan el servidor nou està disponible.
- Emulador queda fora de les altes de Col·lecció; el client bloqueja desar exemplars a aquesta plataforma. Els exemplars històrics es conserven en les dades i es denuncien al diagnòstic, però no compten als totals actius de Col·lecció, portades aleatòries o revisió de compra.
- No es creen exemplars digitals que consolidin silenciosament un físic existent. El client i el SQL bloquegen barrejar formats actius fins a revisar-los. La protecció conservadora s’aplica als registres diferents de PC sense inferir un tipus «consola»; casos de doble format en una plataforma nova que no sigui consola requeriran revisió explícita abans de donar-los per resolts.

### Preservació de Bitàcora

Les entrades continuen vinculades pel seu `joc_id`. Mai s’obté la seva plataforma a partir dels exemplars actuals.

Exemple: una fitxa PC amb exemplars Steam i Epic i entrades de 2020/2022 **no es converteix en Steam**. La fitxa PC i els seus vincles es conserven fins que l’usuari indiqui el destí de les entrades. Es poden preparar fitxes Steam/Epic per als exemplars després de revisar valoracions/comentaris, però cal decidir què queda al joc PC i quines entrades es reassignen. No es copien ni es reparteixen valoracions, comentaris o entrades automàticament.

En una conversió inequívoca s’intentaria conservar l’ID original. Si cal separar una fitxa, algun destí necessitarà un ID nou. Cada exemplar i entrada mantindria el seu ID, modificant `joc_id` només segons un pla explícit revisat. No es prepara cap separació ni fusió automàtica. L’executor de confirmació/retirada preparat posteriorment es descriu al final; continua pendent la inspecció SQL real.

### Exemples de funcionament preparat

- Joc només Steam: fitxa Steam, valoració/comentaris propis i exemplar digital si es posseeix. Plataforma única, cap tipus.
- Mateix títol Steam/Epic: dues fitxes i dos IDs; valoracions, comentaris i entrades independents. Mateix nom no provoca fusió.
- Switch físic/digital: després de revisar-lo, conservar físic actiu i deixar de comptar digital, sense perdre compra original ni entrades. Proposta de conservació: digital retirat (`a_la_colleccio=false`), no eliminat. Si hi ha fitxes separades, cal decidir la fitxa supervivent i preservar/reassignar entrades explícitament.
- Emulador fora de Col·lecció: fitxa Emulador amb entrades de diversos anys, sense exemplar ni dades de compra inventades.

## Migració i proteccions preparades

[202610090001_plataforma.sql](../supabase/migrations/202610090001_plataforma.sql) està **preparada i no executada**. Comprova les signatures conegudes dels RPC abans de crear elements. No executa conversions, fusions, retirades ni reassignacions en aplicar-la; defineix un executor explícit posterior, descrit al final.

Inclou normalització dels noms acordats, detecció de model, RPC d’alta/desament, proteccions contra canvis de plataforma que afectarien vincles, Emulador amb exemplars i barreja de formats. També rebutja donar per resolt un PC digital amb botiga Steam/Epic/itch.io. Els locks de fitxa serialitzen altes de formats oposats.

La restauració reutilitza el motor transaccional existent, mantenint el nom RPC anterior com a entrada de compatibilitat i afegint l’entrada nova. Les funcions mantenen permisos/RLS i exigeixen propietari per escriure. El cos real dels RPC i les interaccions amb triggers s’han de contrastar; comprovar signatures no equival a verificar-ne el comportament.

Preparades [proves SQL sintètiques](../supabase/tests/plataforma.sql) amb rollback, exclusivament per a una instància **local de proves**. Executades posteriorment en PostgreSQL incrustat local amb esquema sintètic; resultats i límits al final. Cap execució remota.

## Còpies, restauració, exportació i revisió

- Sense model nou: exportació ZIP v1. Amb el servidor preparat: dades v2 amb `plataforma_resolta` per fitxa; es preserven tots els IDs, camps originals i exemplars retirats. El manifest d’imatges manté v1 perquè el seu format no canvia.
- El lector accepta v1 i v2. v1 manté plataforma, botiga i vincles originals i es restaura com a pendent; no n’infereix la plataforma. v2 exigeix el marcador, noms canònics quan resolts i les invariants del model nou.
- Una v1 no pot sobreescriure silenciosament una fitxa resolta; la sobreescriptura es bloqueja abans de pujar portades fins a conciliar-la. Afegir només registres absents conserva els existents. v2 requereix el servidor nou abans de restaurar-la.
- CSV mostra Plataforma i format independent. Quan tota la còpia està resolta, desapareix la columna de botiga; en dades mixtes/antigues es conserva com a Botiga original (pendent de conversió). La còpia completa ZIP continua preservant aquesta dada històrica.
- Filtres i gràfics agrupen per nom de plataforma normalitzat, sense agrupar botigues sota PC. El catàleg habitual també es llegeix paginat. No es dedueix Steam d’una botiga antiga en una fitxa PC pendent.
- Revisió de dades incorpora Plataforma i conserva els àmbits Joc/Col·lecció/Bitàcora. Emulador no genera resultats de compra, sense eliminar-ne dades històriques. El diagnòstic de conversió és separat de la consulta de camps buits i no reintrodueix Revisat/Sense revisar.

## Decisions que s’havien deixat pendents abans del diagnòstic privat

Aquest inventari correspon a la fase anterior. L’autor ha comunicat zero casos dels grups ambigus i ha resolt els tres conflictes de formats/compres; vegeu l’actualització final. No es tornen a plantejar com a decisions obertes si el contrast real confirma la cobertura.

1. **Separació PC/botigues i història:** per a cada joc ambigu, destí dels exemplars i de cada entrada, ID que es conserva, i repartiment de valoració/comentaris sense duplicar-los automàticament. Una botiga única actual no acredita totes les entrades històriques.
2. **Consolidació:** exemplar físic i fitxa que es conserven si n’hi ha diversos; confirmar conservar el digital retirat i les seves dades de compra. Decidir les diferències de notes/valoracions/compres que mostri el diagnòstic. Cal aclarir qualsevol cas físic+digital de PC o d’una plataforma no consola abans d’aplicar-hi la regla de consola.
3. **Emulador antic:** què fer amb exemplars històrics existents i les seves compres fora de Col·lecció. No eliminar-los ni crear entrades fictícies; marcar resolta una fitxa Emulador exigeix que no tingui exemplars.
4. **Inspecció real:** revisar SQL i combinacions abans d’aprovar la migració i un pla de conversions. Actualment no hi ha resultats reals per confirmar ni discrepàncies concretes que es puguin donar per resoltes.

La plataforma única, absència de tipus, normalització d’Epic, noves opcions i separació dels jocs per plataforma ja estan confirmades; no es tornen a plantejar com a decisions obertes.

## Controls i límits

TypeScript, ESLint, compilació i proves JavaScript/TypeScript sintètiques: plataformes noves, Epic, mateix títol Steam/Epic, conflictes PC/botiga amb Bitàcora, formats i compra zero, Emulador, còpies v1/v2, CSV, camps no aplicables i preservació dels IDs. Regressions del detall, revisió de dades i selector ZIP. En el Node local les proves TypeScript s’han compilat temporalment amb esbuild abans d’executar-les.

Pendent: SQL real, proves locals amb esquema exportat real i navegador. Les proves PostgreSQL amb fixture sintètica consten al final. Revisió al navegador: Plataforma sota el títol, suggeriments i nom nou, camps antics encara visibles als pendents, absència de Botiga als resolts (fixtures), alta d’Emulador només a Bitàcora, filtres/gràfics independents Steam/Epic, diagnòstic de lectura i restauració/previsualització amb còpies sintètiques. No editar ni restaurar dades reals per validar aquesta tanda.

## Preparació posterior al diagnòstic privat: 10 d’octubre

L’autor confirma que els únics conflictes són **tres jocs Switch**, repetits als grups Formats i Compres. Ha resolt conservar els físics amb les seves dades de compra indicades i retirar del recompte els digitals, conservant-ne totes les dades. No són sis casos diferents. Els noms, preus, anys i identificadors personals no s’incorporen al repositori. La resta de grups es declara a zero en el diagnòstic de l’autor; això no és una inspecció SQL independent feta per l’agent.

**«Conversió pendent: 453» significa 453 fitxes amb `plataforma_resolta !== true`**, incloses les que no tenen exemplars, només tenen retirats o només tenen Bitàcora. No compta exemplars, entrades ni errors. Abans d’afegir la columna, tots els jocs carregats són pendents perquè el marcador no existeix. Aplicar la migració estructural deixa els preexistents pendents; només l’executor posterior els confirma.

### Cobertura i comprovacions locals

Corregida la lectura paginada: contrast amb `count: exact`, avanç segons les files rebudes (també si el servidor limita cada resposta a menys de 500), error si la lectura queda incompleta o el recompte varia. Es contrasta l’empremta `estat_restauracio` abans/després per detectar canvis concurrents. El diagnòstic mostra els totals de les tres taules i denuncia vincles orfes/aliens, IDs repetits, plataformes buides i camps compartits no disponibles. Analitza tots els exemplars, també retirats; totes les entrades, també sense any; tots els jocs, també sense fills. Plataformes buides es preserven buides i bloquegen confirmar una conversió, sense inventar valors.

**Cobertura real encara no comprovada en aquesta sessió:** cal reobrir el diagnòstic actualitzat i contrastar-lo amb les consultes de lectura de `supabase/inspection/plataforma.sql`. La lectura és de les files del propietari visibles a través de RLS; sense inspeccionar RLS no s’afirma que el servidor no n’oculti cap. Un `auth.uid()` nul al SQL Editor no acredita una base buida: cal context autenticat del propietari en una transacció de lectura o una consulta explícitament limitada al seu ID, conservada privadament.

Ha estat possible executar **PostgreSQL local incrustat amb PGlite**, només en memòria i amb dades sintètiques. Docker de Windows no està integrat amb WSL. L’esquema local és una fixture de contracte: no una exportació de Supabase. Els RPC originals d’alta/desament absents del repositori tenen placeholders que no proven el seu comportament; la restauració sí executa el motor SQL existent del repositori. RLS i permisos provats corresponen a la fixture, no a les polítiques reals encara desconegudes.

Proves locals superades:

- Aplicació del SQL de restauració i de la migració de Plataforma. Corregit un àlies ambigu detectat executant PostgreSQL.
- Conversió de 453 fitxes sintètiques amb tres parelles físic/digital, mantenint IDs, camps, valors null, zero i false. Només canvien el marcador i l’estat actiu dels tres digitals; Bitàcora es compara íntegrament abans/després.
- Restauració v1 completa en base buida conservant el model pendent, les compres i els vincles; bloqueig d’una v1 que pretengui sobreescriure una fitxa resolta.
- Restauració v2 completa en base buida i sobreescriptura v2, amb comparació de totes les files de joc/exemplar/entrada.
- Rebuig d’empremta antiga i rollback íntegre d’un pla incomplet, Emulador amb exemplar, formats oposats i canvi de plataforma amb vincles. Convidat pot consultar però no editar via RLS, convertir ni restaurar.
- Lectura sintètica de 1001 files per taula, límit de 200 per resposta, lectura incompleta, permisos i canvi de sessió. Proves de còpies/ZIP, revisió i plataformes; TypeScript, ESLint i compilació.

Executar des de l’arrel, sense Supabase:

```sh
npm install --prefix /tmp/tsumige-pg-tests --no-audit --no-fund @electric-sql/pglite@0.5.8
node supabase/tests/local/run.mjs
node supabase/tests/local/review-loader.mjs
```

La dependència de proves queda a `/tmp`, fora de les dependències de l’aplicació. Es pot indicar una altra ubicació amb `TSUMIGE_PGLITE_MODULE`. No s’ha executat cap SQL contra Supabase ni s’ha publicat.

### Executor preparat i recomptes previstos

`convertir_plataformes(p_retirar uuid[], p_estat text)` queda preparat dins la migració, sense cap crida automàtica ni botó d’aplicació. Només propietari, IDs explícits i empremta de les dades revisades; locks i operació transaccional. Cada digital indicat ha de ser actiu i vinculat a un joc Switch amb un únic físic actiu. Rebutja IDs duplicats, aliens, conflictes no resolts o barreja restant. No vincula pel títol, no fusiona jocs, no dedueix botigues, no canvia compres ni `joc_id`. Canonitza només els alias acordats i marca les fitxes resoltes; retira digitals amb `a_la_colleccio=false`.

| Recompte | Previsió real condicionada al contrast | Prova sintètica |
| --- | --- | --- |
| Fitxes de joc i IDs | Sense canvi; total real pendent de contrast | 453 → 453 |
| Conversió pendent | 453 → 0 si són totes les pendents i no hi ha bloquejos | 453 → 0 |
| Exemplars totals i IDs | Sense canvi | 6 → 6 |
| Físics actius | Sense canvi | 3 → 3 |
| Digitals actius | −3 si hi ha exactament un digital per cas confirmat | 3 → 0 |
| Exemplars actius / retirats | −3 / +3 sota la mateixa condició | 6 → 3 / 0 → 3 |
| Entrades de Bitàcora, IDs i vincles | Sense canvi | 6 → 6 |

No es coneixen aquí els totals reals d’exemplars, retirats ni entrades. Si hi ha més digitals, diversos físics, compra física diferent de l’aprovada o altres avisos de cobertura, el pla s’ha de tornar a contrastar; no s’amplia l’autorització automàticament.

### Passos concrets abans d’aplicar, encara sense executar

1. Descarregar una **còpia ZIP completa prèvia**, comprovar que es pot llegir i custodiar-la fora del repositori. Incloure portades; exportar també esquema/RPC/triggers/polítiques i una còpia de base de dades amb les eines del projecte/compte. Aturar temporalment edicions i restauracions durant l’operació.
2. Executar les consultes **només de lectura** d’inspecció real, contrastar recomptes i RLS, signatures/cossos de RPC, triggers, claus i nullabilitat. Guardar els resultats privadament. Sense aquest accés no es considera validada l’aplicació real.
3. Recrear aquest **esquema real** en una instància local aïllada amb usuaris/dades sintètiques; executar les dues migracions i les proves. La fixture de contracte actual no substitueix aquesta prova. Comprovar també Storage/portades amb Supabase local; PGlite només prova SQL, no Auth/Storage/PostgREST.
4. Preparar un pla privat amb els **IDs dels tres físics i tres digitals**, IDs dels jocs, dades físiques aprovades i totals abans/després. Verificar la compra indicada contra cada físic; no omplir camps buits. Confirmar que no hi ha més exemplars implicats ni avisos aliens a aquests casos. Els tres físics no s’actualitzen: es conserven les seves dades existents.
5. Només amb autorització d’aplicació, aplicar `202610090001_plataforma.sql` i comprovar que l’estructura no ha canviat els valors històrics (afegeix el marcador). Reobrir el diagnòstic i obtenir una empremta **posterior a la migració**, perquè la columna nova canvia l’empremta. Contrastar novament amb el pla privat; no reutilitzar la d’abans de la migració.
6. En una transacció, cridar l’executor amb els tres IDs digitals del pla i l’empremta contrastada. Comprovar recompte, totes les compres/notes/valoracions i Bitàcora; davant qualsevol diferència inesperada, rollback. Conservar el resultat privat, sense fer-lo públic al repositori.
7. Descarregar una còpia v2 posterior i provar-ne restauració en local. Revisar consulta/edició/navegació, físics actius, digitals històrics, convidat, filtres/estadístiques i restauracions. Publicar l’aplicació seria una autorització separada; no està feta en aquesta tanda.

Els tres conflictes comunicats estan resolts per l’autor; no es tornen a demanar decisions sobre aquests criteris. **Bloquejos restants són de verificació i accés**, no decisions noves assumides: esquema/RPC/RLS reals, cobertura real, IDs i totals reals, prova local amb esquema real i navegador. Les discrepàncies generals de l’auditoria que no corresponen a Plataforma continuen pendents.

### Informe de metadades per retornar des de Supabase

Per a la inspecció d’esquema utilitzar ara [PLATAFORMA-ESQUEMA-LECTURA.sql](../supabase/inspection/PLATAFORMA-ESQUEMA-LECTURA.sql), amb les instruccions de [VALIDACIO-PLATAFORMA.md](VALIDACIO-PLATAFORMA.md). Retorna un únic JSON exportable amb definicions/permisos/configuració de Storage, sense consultar registres personals. El fitxer antic `inspection/plataforma.sql` inclou diagnòstic de dades agregades i no és el que cal executar per a aquest informe. Consulta nova provada en READ ONLY local; pendent d’execució per l’autor i contrast de l’informe real.

### Contrast amb l’informe real rebut

Rebut l’informe de metadades del SQL Editor i contrastat privadament. Les signatures, columnes, claus i RPC públiques necessàries estan disponibles; no hi ha marcador/RPC nous perquè encara no s’ha aplicat la migració. L’esquema públic, triggers i RLS s’han reconstruït localment amb dades sintètiques i han passat les proves de migració, conversió, restauracions v1/v2, alta/desament i permisos. Corregida una variable ambigua d’alta SQL detectada amb les RPC reals. Les restriccions de vincle inclouen joc i propietari i estan validades.

Els triggers reals mantenen la valoració compartida i actualitzen `updated_at` de les files modificades. Es preserven `created_at`, totes les dades històriques, físics i Bitàcora; no es força conservar una data d’actualització antiga després d’una modificació. Restauració i conversió eviten actualitzacions redundants.

RLS de Storage i protecció DELETE provades sobre suport local mínim, però interns de Storage redactats i API encara no verificats. Totals/IDs/dades reals no formen part de l’informe i continuen pendents. Aquest contrast substitueix la limitació anterior de no tenir definicions públiques reals; no acredita API remota, navegació ni conversions reals. Resultats i límits exactes a [VALIDACIO-PLATAFORMA.md](VALIDACIO-PLATAFORMA.md#resultat-rebut-i-contrast-local). Sense aplicar ni publicar.

### Comprovació final i aplicació atòmica proposada

[PLA-FINAL-PLATAFORMA.md](PLA-FINAL-PLATAFORMA.md) és ara el procediment detallat de comprovació de dades, pla privat, còpia definitiva, aplicació i recuperació. Substitueix la seqüència anterior d’aplicar estructura i conversió separadament: es proposa un únic script/transacció amb les assercions abans de COMMIT. Aquesta aplicació no està executada ni autoritzada en la tanda actual. La plantilla de lectura no conté dades personals; els criteris emplenats i els resultats/plans queden fora del repositori. Encara falta el resultat real de dades per completar IDs i recomptes.
