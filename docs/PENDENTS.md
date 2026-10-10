# Treball pendent

## Estat actual de Plataforma i publicació

- Conversió del pla 002 aplicada una vegada per l’autor i verificada amb informes posteriors: `coincideix=true`, cap diferència, cap fitxa pendent i només els tres digitals aprovats fora del recompte actiu. Identificadors, compres, comentaris, valoracions, vincles, Bitàcora i propòsits preservats. No repetir la migració.
- ZIP previ contrastat i captures reals de dades/esquema custodiades privadament. Reversió transaccional preparada, no executada; rebutja edicions posteriors. No és un dump global d’Auth/Storage ni una recuperació completa d’un projecte perdut.
- Comprovacions funcionals locals de Plataforma confirmades per l’usuari. Publicació del codi autoritzada. Pendents de verificació independent: web desplegada, restauració/recuperació remotes, serveis Auth/Storage no comprovats explícitament i concurrència multiclient.
- Favorit fora de Col·lecció, conciliació de comentaris, revisió general del disseny i altres propostes obertes de l’auditoria continuen pendents. Aquesta publicació no les aprova.
- Les seccions de preparació que segueixen són històriques; els seus pendents d’aplicació, captura i comprovació local de Plataforma queden substituïts per aquest estat.

## Funcionalitats

- Preparar un esquema i migracions genèrics perquè tercers puguin instal·lar la seva instància sense dades personals.
- Ampliar les estadístiques amb combinacions com despesa per any i plataforma o valoracions per gènere, quan es concreti el disseny.
- Gestió més completa de categories i reorganització dels gèneres i plataformes.
- Completar els filtres útils del pla inicial: favorits, possible venda/intercanvi, desenvolupadora i valoració; concretar-los abans d'ampliar la llista de controls.

## Decisions confirmades

- Inici: Jugant i Per jugar aviat han de tenir alçades independents.
- Substituir els propòsits de l’any anterior a Inici per tres portades aleatòries de registres actius de la col·lecció, enllaçades al detall, sense repetir joc i amb selecció estable durant la visita. Si n’hi ha menys de tres amb portada, mostrar les disponibles. Mantenir els propòsits de l’any actual i la consulta dels anteriors a Propòsits.
- Donar més protagonisme visual a les portades, adaptant la distribució a l’espai disponible i al mòbil, sense deformar ni retallar imatges.
- Tancar el desplegable de plataformes de Col·lecció clicant fora, tornant a prémer el botó o amb Esc, conservant la selecció múltiple.
- Afegir Anterior i Següent a la part superior dreta del detall, mantenint els inferiors, els filtres i l’ordre.
- Desar o descartar canvis no ha de tancar el detall; separar aquestes accions de Tanca.
- Obrir el detall en mode consulta, amb Edita per activar els camps. Desar o descartar torna al mode consulta del mateix joc. Els convidats només poden consultar.
- Retirar de la interfície definitiva les marques, filtres i indicadors Revisat / Sense revisar.
- Favorit és independent de la valoració i ja existeix; comprovar-ne la disponibilitat als jocs fora de la col·lecció.
- Plataforma única sota el nom, sense tipus interns: Steam, Epic Games, itch.io, PC, consoles i Emulador al mateix nivell. Diferents plataformes són diferents registres de joc, sense fusió per títol; físic/digital independent i noves opcions de text. Epic es normalitza a Epic Games. Emulador només a Bitàcora; a la mateixa consola només compta el físic si també hi ha digital, després de revisar discrepàncies.

## Pendents de revisió o decisió

Les propostes següents no estan aprovades per implementar-les.

- Revisar la distribució del detall i reduir el control de valoració, amb una ubicació adequada.
- Auditoria local del detall completada a [AUDITORIA-DETALL.md](AUDITORIA-DETALL.md). Pendent de contrastar l’esquema real de Supabase i decidir les correccions, omissions i camps condicionals; no assumir que tots s’han de mostrar.
- Primera versió de Revisió de dades implementada localment a Configuració; criteris i exclusions a [REVISIO-DADES.md](REVISIO-DADES.md). Pendent de revisió visual i de decidir els camps condicionals, l’any de joc, la conciliació de notes/valoracions i el detall de fitxes sense registres vinculats.
- Col·lecció ha de donar d’alta jocs; Bitàcora, entrades de joc. Es planteja cercar un joc existent o escriure un títol nou fora de la col·lecció a Bitàcora; el funcionament concret queda per decidir.
- Substituir el terme experiència; proposta: entrada de Bitàcora.
- Plataforma: criteris resolts, proposta substituïda i preparació local a [PROPOSTA-PLATAFORMA.md](PROPOSTA-PLATAFORMA.md). Pendents la inspecció SQL real i els destins de cada exemplar/entrada, valoracions, comentaris i compres dels casos ambigus. Migració preparada, sense aplicar conversions.
- Revisar la vista llista de Col·lecció, inclosa una possible miniatura al costat del nom.
- Possible pujada de portades pròpies. La presentació d’imatges panoràmiques s’ha ajustat en la segona tanda; queda pendent de revisió visual.
- Validar visualment els llindars de dues i tres columnes de Jugant i Per jugar aviat, amb portades grans, títol i plataforma a sota (implementació autoritzada en la segona tanda).
- Ordre de Jugant i Per jugar aviat encara no decidit; l’ordre manual és només una proposta.

## Primera tanda del 9 d’octubre de 2026

Completat: alçades independents, tres portades aleatòries a Inici i tancament del desplegable de plataformes. L’autor ha comprovat aquesta primera tanda al navegador i confirma que funciona correctament. La resta de decisions confirmades queda pendent de tandes posteriors.

La revisió manual dels registres no bloqueja aquestes millores.

## Segona tanda del 9 d’octubre de 2026

- Quadre aleatori titulat «Jocs a l’atzar»; títol i plataforma de cada joc centrats sota la portada.
- Jugant i Per jugar aviat: portades més grans, amb títol i plataforma a sota, mantenint els enllaços al detall i les alçades independents.
- Distribució segons l’amplada interior de cada quadre amb consultes de contenidor: una columna per defecte, dues a partir de 22 rem i tres a partir de 32 rem. Màxim de tres per fila.
- Espai d’imatge amb alçada comuna i amplada limitada a la columna; `object-contain` mostra portades verticals i panoràmiques senceres, sense deformar-les ni alterar l’amplada de la distribució. Es conserva el logotip alternatiu quan falta la portada o falla la càrrega a Jugant i Per jugar aviat.
- Verificació: TypeScript, ESLint, compilació i revisió del CSS generat. No hi ha navegador disponible en aquest entorn; la presentació i les interaccions d’aquesta tanda queden pendents de revisió visual.
- Revisió preparada: obrir Inici en escriptori i mòbil (320–390 px), variar l’amplada i comprovar una, dues i tres columnes segons el quadre; revisar noms llargs, imatges panoràmiques, absència de portada, alçades diferents i enllaços al detall.

## Centrat de files incompletes

- Jugant i Per jugar aviat centren cada fila, també les últimes amb un o dos jocs quan hi ha més de tres registres.
- Cada joc conserva l’amplada que tindria en una fila completa: no creix per ocupar els espais buits. Es mantenen els llindars de 22 i 32 rem, les portades senceres, els enllaços i les alçades independents.
- Verificació: controls del projecte, CSS generat i comprovació dels càlculs de files amb 1–8 jocs en una, dues i tres columnes. No s’ha pogut fer revisió visual en aquest entorn sense navegador; cal confirmar les últimes files, especialment amb 4, 5, 7 i 8 jocs.

## Detall: navegació, desament i descart (implementat)

- Anterior i Següent disponibles a la part superior dreta i a la part inferior, amb la mateixa llista i els mateixos límits. La llista i l’ordre dels registres filtrats es fixen en obrir el detall: desar un camp que afecta els filtres o l’ordre no impedeix continuar navegant. Tanca conserva els filtres de la llista.
- Desar manté oberta la fitxa del mateix joc, recarrega les dades desades i mostra «Canvis desats». Es poden tornar a editar i continuar amb Anterior/Següent.
- «Desfés els canvis» restaura els camps, la valoració, la portada i els controls de botiga/format a les dades desades, sense tancar ni canviar de joc. «Tanca» és una acció diferenciada.
- Anterior/Següent, Tanca, Esc i l’accés a la col·lecció des de Bitàcora protegeixen els canvis pendents amb les opcions Desa i continua / Descarta i continua / Continua editant. S’afegeix l’avís natiu en recarregar o sortir de la pàgina. Durant el desament es bloquegen les accions; si falla el desament o la recàrrega, es conserva l’esborrany i es mostra l’error.
- Els convidats mantenen els camps desactivats i no tenen accions de desament o desfés. El mode consulta/edició s’ha implementat en la tanda següent; altres canvis de disseny continuen pendents. L’alta de registres conserva el tancament després de crear-los.
- Verificació: TypeScript, ESLint, compilació, proves existents i comprovacions aïllades del component amb dades i desaments simulats (èxit, error, desfés, confirmació, límits, convidats, bloqueig mentre desa i continuïtat amb filtres). Cap prova escriu a Supabase.
- Limitació: sense navegador disponible, no s’han verificat les interaccions DOM reals ni la presentació en escriptori/mòbil. Revisió manual pendent: desar i tornar a desfer, errors de desament, navegació superior/inferior amb filtres, primer/últim registre, Tanca/Esc amb canvis pendents i sessió de convidat.
- Implementació completada; es mantenen les limitacions de verificació indicades.

## Detall: mode consulta/edició (implementat)

- Els jocs s’obren en consulta, amb portada sencera, informació de lectura, indicadors booleans i valoració compacta destacada; A+ i A++ continuen en vermell. El preu zero es mostra com a zero euros, i els valors buits no es converteixen en zero o en negacions.
- «Edita» disponible per al propietari activa els controls existents. Es conserven tots els camps d’edició, la configuració de portades, la botiga/servei i les accions de retirar o recuperar exemplars. Els exemplars retirats s’han de recuperar abans d’editar; l’alta continua obrint directament el formulari.
- Desar correctament torna a consulta del mateix joc amb les dades actualitzades. «Desfés els canvis» recupera les dades desades i torna a consulta, també si no s’ha canviat cap camp. Un error manté l’edició i l’esborrany.
- Els convidats només veuen la consulta, sense formulari, Edita ni accions que modifiquin la col·lecció. Es mantenen les comprovacions de permisos del desament.
- Es conserva la tanda anterior: Anterior/Següent superior i inferior, ordre i filtres, límits i confirmació de canvis pendents abans de navegar o tancar.
- Consulta adaptable: portada damunt de la informació al mòbil i al costat en escriptori; indicadors i accions poden ocupar diverses línies. L’auditoria local i la retirada dels controls Revisat s’han fet en una tanda posterior; el contrast amb l’esquema real continua pendent.
- Verificació: TypeScript, ESLint, compilació, proves existents i comprovacions aïllades amb dades simulades de consulta inicial, Edita, desament/desfés, error, convidats, exemplars retirats, alta i regressions de navegació. Comprovats també zero euros, indicadors i color de A+/A++. Sense escriure a Supabase.
- Pendent de navegador real: presentació en escriptori i mòbil, focus, desament i error de xarxa, configuració de portada, confirmacions amb Tanca/Esc i consulta de convidats. Els controls simulats no substitueixen aquesta revisió visual i d’interaccions DOM.
- Implementació completada; revisió visual pendent.

## Detall: etiquetes, favorit, valoració i capçalera (implementat)

- En consulta només es mostren les etiquetes activades: Jugant, Per jugar aviat, Per jugar amb infants, Possiblement d’intercanvi, Reproducció i No localitzat. Sense Sí/No ni espai reservat si no n’hi ha. Els tics d’edició es conserven.
- Favorit es representa amb una estrella discreta al costat del títol i el text accessible «Joc favorit», només quan està activat. El tic continua disponible en edició.
- Valoració única, més gran i centrada sota la portada en consulta. Sense marcador quan és buida; A+ i A++ mantenen el vermell. El control d’edició es conserva.
- Atribució amb l’enllaç guardat i l’etiqueta IGDB o RAWG sota la valoració, o sota la portada si no hi ha valoració. El proveïdor es reconeix pel domini del URL; no s’assignen fonts inventades a URL desconeguts.
- Capçalera amb una columna pròpia per als controls a la dreta en escriptori: Anterior/Següent i accions del mode actual. El títol pot ocupar diverses línies, també amb paraules llargues. En mòbil, la zona d’accions va sota el títol i pot ocupar diverses línies. Els botons superiors de desament actuen sobre el mateix formulari que els inferiors.
- Es mantenen les tandes locals anteriors: consulta/edició, desament, desfés, errors, tancament, navegació filtrada i permisos dels convidats.
- Verificació: TypeScript, ESLint, compilació i proves existents; comprovacions aïllades amb dades sintètiques de les 64 combinacions d’etiquetes, favorit activat/desactivat, absència de valoració, ordre portada/valoració/font, fonts guardades, títols llargs i imatges verticals, quadrades i panoràmiques. També regressions de desament/desfés, errors, navegació i convidats.
- Limitació: sense navegador disponible no s’han verificat visualment la capçalera, els salts de línia ni les proporcions reals de les imatges en escriptori/mòbil. Revisió visual pendent. No s’ha escrit a Supabase.
- La revisió general del disseny continua pendent; l’auditoria local s’ha completat posteriorment, amb el contrast de l’esquema real encara pendent.

## Retirada de la revisió d’importació i auditoria (canvis locals)

- Retirats el filtre Sense revisar, la secció Revisió de la importació, les etiquetes Revisat/Sense revisar de la llista i el tic Revisat del detall. No hi havia un recompte separat de revisats a la interfície.
- El desament conserva explícitament el valor existent de `revisat` en exemplars i experiències. El camp es manté als tipus, còpies ZIP, CSV i restauració; cap migració ni canvi de dades. Les funcions de consulta, edició i navegació es conserven.
- [Auditoria del detall](AUDITORIA-DETALL.md) completada amb inventari separat de joc, col·lecció i Bitàcora: camps visibles, editables, condicionals, absents i tècnics. Només codi/tipus/migració locals; l’esquema real i les definicions dels RPC no estan disponibles per a aquesta inspecció.
- Discrepàncies principals: Favorit és d’exemplar i no es pot marcar als jocs sense exemplar; sinopsi i gèneres secundaris no apareixen al detall; valoracions/notes antigues conviuen amb els camps compartits; Jugant actua sobre el conjunt del joc. Per jugar amb infants és un camp de joc i sí que és editable des de Bitàcora encara que el joc no es posseeixi.
- Documentada la proposta de Revisió de dades, sense implementar-la. Pendent de decidir Favorit de joc/exemplar, camps absents/condicionals i àmbits/selector/actualització de resultats de l’eina. Les propostes no s’han donat per aprovades.
- Controls: TypeScript, ESLint, compilació, proves existents i comprovacions aïllades amb dades sintètiques de consulta/edició/navegació i preservació de true/false de `revisat`. Sense navegador real: pendent de verificació visual. Sense escriure a Supabase ni publicar.

## Revisió de la interfície

- Continuar refinant el detall dels jocs i la presentació de la Bitàcora.
- Revisar què es mostra a les fitxes de la col·lecció i al detall.
- Revisar l’accessibilitat, la vista mòbil i la coherència dels filtres amb cada canvi.

## Idees guardades, sense activar

- Bloc editorial a Inici amb una imatge de joc i un text breu propi o d’una font externa: idea futura, sense aprovar ni implementar.
- Botons Tots / Els millors / Favorits de Jocs a l’atzar: proposta pendent de confirmar; no implementada.

La revisió manual dels registres personals es fa a la base de dades i no és una tasca del repositori públic.

## Implementat el 7 d’octubre de 2026

- Recuperació de contrasenya per correu des de l’accés.
- Restauració ZIP amb revisió prèvia, opció d’afegir només els registres absents o actualitzar també els existents, i recuperació de portades a Storage privat.

## Descartat

- Mode fosc i instal·lació PWA, per decisió de l’autor.
- Filtre físic/digital per any; es mantenen els de plataforma i gènere.

## Bitàcora: accés al detall de Col·lecció (canvis locals)

- L’accés utilitza exclusivament `joc_id` i l’identificador de l’exemplar, mai coincidències de títol. Només considera exemplars actius.
- Un exemplar: obre directament el seu detall en consulta, amb portada i les dades disponibles. Diversos: ofereix una selecció amb format, regió, botiga, conservació, compra, preu i identificador per distingir fins i tot duplicats. Cap exemplar: no mostra cap enllaç a resultats buits; el detall de Bitàcora continua accessible.
- Tanca/Esc del detall de Col·lecció torna al detall de Bitàcora. La llista original continua muntada: conserva any, cerca, filtres i ordre de navegació. No es canvia la ruta ni s’escull un exemplar arbitràriament.
- Es conserven els permisos dels convidats i la confirmació dels canvis pendents, també abans de seleccionar un exemplar i en tancar-ne el detall.
- Verificació amb dades sintètiques: zero, un i tres exemplars; exclusió de retirats i d’un joc amb un altre identificador; selecció explícita, retorn, propietari/convidat i protecció dels canvis pendents. Regressions de consulta, edició, desament, error i navegació superades. TypeScript, ESLint, compilació i proves existents superades.
- Sense navegador disponible: pendent de comprovar focus i obertura/tancament dels diàlegs reals, selecció en mòbil/escriptori i conservació visual dels filtres. La comprovació aïllada no substitueix aquesta revisió. Sense modificar Supabase ni publicar.
- L’auditoria anterior i les seves decisions pendents continuen a [AUDITORIA-DETALL.md](AUDITORIA-DETALL.md); aquesta correcció no modifica el model de dades.

## Configuració: Revisió de dades (canvis locals)

- Consulta reservada al propietari, amb àmbits Joc / Col·lecció / Bitàcora, camp seleccionable, cerca per títol i filtres de format, retirats o seguiment quan pertoquen. Sense marques Revisat/Sense revisar.
- Camps inclosos: portada, gènere principal, valoració i comentaris compartits confirmats; any/preu de compra per exemplar; completat de Bitàcora. Text buit o només espais és buit; zero i false no ho són. No tenir valoració no s’etiqueta com a error.
- Lectura paginada específica, llista compacta i detall en consulta amb selecció explícita si hi ha diverses vinculacions. Anterior/Següent conserva l’ordre de revisió; desar actualitza resultats mantenint el registre obert encara que deixi de coincidir. Tanca conserva camp i filtres; es mantenen els permisos i la protecció d’esborranys.
- Exclosos els camps opcionals no carregats, comentaris amb notes antigues i camps amb aplicabilitat pendent. Fitxes sense exemplar/entrada es compten a part i no generen registres ficticis. Vegeu [REVISIO-DADES.md](REVISIO-DADES.md) per als límits i decisions pendents.
- Controls: TypeScript, ESLint, compilació, proves existents i noves proves sintètiques de buits/espais/zero/false/no aplicable, vinculacions i navegació; comprovacions aïllades de permisos, filtres i desament. Proves sense dades reals ni migracions. Sense navegador: pendent de revisar escriptori/mòbil, focus, selecció i interaccions reals del detall. Canvis locals, sense publicar.

## Configuració: ordre i distribució (canvis locals)

- Primera fila: Còpia de seguretat a l’esquerra i Recupera una còpia a la dreta, en dues columnes a partir de 1024 px. Els quadres s’alineen a dalt i mantenen alçades independents segons el contingut. Per sota, una sola columna en aquest mateix ordre.
- Exporta per consultar amb Excel ocupa la fila següent. Revisió de dades queda al final, a tota l’amplada, sense opcions de configuració sota les llistes llargues. Canvia la contrasenya continua abans dels quadres.
- Retirat només el quadre Jocs retirats de Configuració; es conserven els registres, la Bitàcora i els mecanismes existents de consulta, còpia, restauració i exportació de retirats. Funcions i permisos preservats.
- Controls: ESLint, TypeScript i compilació; proves existents de còpia/restauració i revisió de dades. Ordre dels components i classes de distribució comprovats. Sense navegador disponible: pendent de revisar l’alineació real en escriptori, el pas a una columna en finestres estretes i mòbil, els quadres amb missatges/previsualització de restauració i la revisió amb una llista llarga. Sense modificar Supabase ni publicar.

## Configuració: còpia integrada i selector ZIP (canvis locals)

- Aquesta distribució substitueix l’anterior: primera fila en escriptori amb Còpia de seguretat a l’esquerra i Exporta per consultar amb Excel a la dreta. Dues columnes a partir de 1024 px, alçades independents; una columna per sota, en aquest ordre. Revisió de dades continua al final i a tota l’amplada.
- Còpia de seguretat integra dues parts diferenciades: Descarrega una còpia i Recupera una còpia, separades amb un encapçalament i una línia. Es conserven tots els missatges i fluxos existents.
- Selector de fitxer substituït pel botó natiu accessible Selecciona una còpia ZIP, amb el mateix component de botó que la resta de la interfície. Mostra Cap fitxer seleccionat inicialment i el nom complet, amb salts de línia si cal, després de seleccionar-lo; el nom s’anuncia com a estat i s’associa al botó. Cancel·lar el selector conserva la selecció/previsualització anterior. Es pot tornar a seleccionar el mateix ZIP.
- Seleccionar només valida i prepara la previsualització: no restaura automàticament. Es mantenen la confirmació, l’opció de sobreescriptura, la còpia prèvia, els errors, el bloqueig mentre treballa i els permisos.
- Controls: ESLint, TypeScript, compilació, proves existents i comprovacions aïllades del selector amb un ZIP sintètic (estat inicial, botó, nom, cancel·lació, previsualització sense restauració, confirmació obligatòria, error de mida i convidat). Sense modificar dades reals ni Supabase; sense publicar.
- Sense navegador disponible: pendent de revisar visualment escriptori/mòbil, noms de fitxer llargs, tabulació i activació amb Enter/Espai, diàleg natiu de selecció i previsualització real. Els controls simulats no substitueixen les interaccions del navegador.

## Unificació de Plataforma: anàlisi inicial (substituïda)

- Inventari d’usos i combinacions completat. La proposta inicial de tipus interns i seleccions per exemplar/entrada ha estat descartada; [PROPOSTA-PLATAFORMA.md](PROPOSTA-PLATAFORMA.md) recull ara els criteris confirmats i la preparació vigent.
- Plataforma actual pertany al joc; Botiga o servei a l’exemplar; Bitàcora no identifica l’exemplar utilitzat. No es poden propagar botigues a entrades ni unir fitxes pel títol.
- L’abast per fitxa i l’absència de classificació estan resolts en la tanda següent. Continuen pendents les discrepàncies concretes de conversió i la inspecció real, així com les altres discrepàncies de l’auditoria general.
- Aquella tanda només va modificar documentació. Esquema, RPC, importador original i freqüències reals encara no verificats; la preparació de codi posterior es descriu a continuació.

## Plataforma única: implementació preparada, sense migrar

- Substituïda la proposta de classificació i excepcions per registre pels criteris confirmats: una plataforma de text per fitxa, sense tipus ni agrupació de botigues sota PC. Mateix títol en plataformes diferents conserva fitxes independents. Suggeriments i noves opcions lliures.
- Codi compatible amb dades antigues; Botiga es conserva en pendents i desapareix als resolts. Preparats marcador tècnic de transició, RPC i proteccions d’Emulador, plataforma amb vincles i físic/digital; cap conversió aplicada. Entrades antigues no reben botiga deduïda dels exemplars.
- Diagnòstic privat de lectura a Configuració amb grups de plataforma/botiga, Bitàcora, formats, compres, valoracions, comentaris, Emulador i coincidències. No té acció d’aplicar conversions.
- Preparades lectura v1/v2 de còpies, nova exportació v2 quan el servidor l’admeti, restauració amb bloqueig de sobreescriptures antigues ambigües, CSV i Revisió de dades. Originals, IDs, retirats i compres preservats.
- SQL de lectura d’inspecció, migració i proves SQL amb rollback preparats, no executats. No hi ha connexió d’inspecció ni PostgreSQL local: esquema i combinacions reals no verificats. Abans de migrar cal contrastar RPC/triggers i presentar les discrepàncies reals agrupades.
- Respostes pendents només per als casos concrets: destí d’entrades en separar PC/botigues, repartiment de valoracions/comentaris, exemplar/fitxa que es conserva i compra del digital retirat, i conservació d’exemplars antics d’Emulador. No s’ha programat un executor de conversió massiva.
- Controls TypeScript, ESLint, compilació i proves sintètiques (incloent regressions i còpies v1/v2). SQL i navegador no verificats; revisar amb fixtures locals les altes, errors, plataforma nova, diagnòstic, filtres, estadístiques i restauració. Sense modificar Supabase ni publicar.


## Plataforma: casos resolts i proves locals de conversió

- L’autor resol els tres conflictes Switch que apareixien duplicats als grups Formats/Compres: conservar físics i compres aprovades; retirar només digitals del recompte, mantenint dades i Bitàcora. No s’incorporen dades personals al repositori. Els altres grups es declaren a zero en el diagnòstic privat; contrast independent encara pendent.
- «Conversió pendent: 453» són fitxes sense marcador tècnic confirmat, no errors ni exemplars. Lectura reforçada amb recomptes exactes, paginació segons files rebudes, empremta abans/després i avisos d’orfes/IDs/plataformes buides/camps no disponibles. No s’han consultat els recomptes reals aquí.
- Executor SQL preparat amb IDs explícits i empremta, només propietari, transacció i bloqueig de conflictes. Cap execució automàtica, deducció de botiga, fusió o reassignació; conserva preus, anys, null, zero, false i camps històrics.
- Migracions i restauracions v1/v2 executades en PostgreSQL local incrustat (PGlite), amb esquema i usuaris sintètics. Corregit àlies ambigu del SQL de restauració. Fixture amb 453 fitxes: pendents 453→0, exemplars 6→6, actius 6→3, físics 3→3, entrades 6→6; comparació íntegra de dades. Convidat consulta però no edita/converteix/restaura. Lectura amb límit de 200, 1001 registres per taula i errors comprovada.
- TypeScript, ESLint, compilació i proves de còpia/restauració, dades buides i plataformes superades. Advertiment de mida del bundle existent.
- Encara **no validats**: esquema/RPC/triggers/RLS de Supabase real, cobertura i totals reals, IDs del pla, proves amb esquema real exportat, Storage/Auth/PostgREST i navegador. PGlite i RLS sintètiques no acrediten aquests punts. Docker no està integrat a WSL i no hi ha connexió SQL al projecte en aquesta sessió.
- [PROPOSTA-PLATAFORMA.md](PROPOSTA-PLATAFORMA.md) conté recomptes condicionats i passos d’aplicació amb còpia ZIP/esquema prèvia, inspecció de lectura, pla privat per IDs, empremta posterior a la migració i verificació amb rollback. Cal reobrir el diagnòstic al navegador per veure la cobertura nova. No s’ha modificat Supabase ni publicat.

## Plataforma: consulta de metadades per a validació real

- Preparada [PLATAFORMA-ESQUEMA-LECTURA.sql](../supabase/inspection/PLATAFORMA-ESQUEMA-LECTURA.sql): un únic informe JSON d’esquema, RPC/triggers, RLS, permisos i configuració del bucket de portades, sense consultar registres personals ni fitxers de Storage. Redacció de literals susceptibles de contenir informació privada.
- [VALIDACIO-PLATAFORMA.md](VALIDACIO-PLATAFORMA.md) indica la ruta Windows/WSL, com executar-la al SQL Editor i retornar JSON/CSV complet fora del repositori.
- Consulta verificada localment en transacció READ ONLY amb esquema sintètic. Execució a Supabase i contrast amb l’esquema real pendents de rebre el resultat; cap dada o permís modificats ni publicació.
- 453 són fitxes pendents, no discrepàncies. Els tres conflictes físic/digital ja estan resolts; no es reobren decisions ni s’executen conversions.

## Plataforma: informe real rebut i proves sobre esquema reconstruït

- Informe de metadades rebut privadament, sense incorporar-lo al repositori. Contrastades columnes, signatures/cossos públics, constraints, RLS i triggers reals. Bucket privat de 20 MiB/MIME confirmats a l’informe. Claus compostes validades protegeixen joc/propietari; política de lectura del propietari sense exclusions internes.
- Esquema públic/RPC/triggers/RLS reconstruïts en PostgreSQL local amb comptes sintètics. Migració, conversió 453 fitxes, restauracions v1/v2, alta/desament, valoració compartida, convidat, compte aliè i anònim superats. Detectada i corregida variable SQL ambigua d’alta; no s’ha aplicat a Supabase.
- Contrastades RLS i protecció DELETE de Storage amb objectes ficticis. Interns de Storage només parcialment reproduïts perquè alguns noms/ACL van quedar redactats. API/Auth/PostgREST, fitxers/URL signades i navegador continuen pendents; no donar-los per verificats.
- Prova amb timestamps antics: preserva created_at, físics i Bitàcora; updated_at canvia als registres modificats segons els triggers existents. Evitades actualitzacions redundants del marcador en restaurar i de jocs ja resolts en convertir.
- TypeScript, ESLint, compilació i proves locals superades; avís habitual de mida del bundle. Totals i IDs reals encara pendents de diagnòstic/pla privat; 453 són fitxes pendents, els tres casos estan resolts. Sense conversions reals ni publicació. Detall i reproducció a [VALIDACIO-PLATAFORMA.md](VALIDACIO-PLATAFORMA.md).

## Plataforma: comprovació final de dades preparada

- Plantilla pública de lectura i còpia privada a `/tmp` amb els tres criteris aprovats. Un únic SELECT contrasta propietari/totals, totes les files/IDs, retirats i entrades sense any, un físic i un digital actius per cas, compra física, diagnòstic i empremtes. Encara pendent de rebre l’informe real de dades; el CSV anterior només era d’esquema.
- Preparador de pla privat per IDs fora del repositori, amb bloqueig de canvis i comparació amb una base anterior, sense sobreescriure-la. Recomprovacions per IDs i verificació posterior també només de lectura. No s’han inventat IDs ni recomptes reals; cap conversió aplicada.
- [PLA-FINAL-PLATAFORMA.md](PLA-FINAL-PLATAFORMA.md) detalla execució Windows/SQL Editor, retorn privat, moment del ZIP definitiu, futura transacció única amb assercions/locks, verificació posterior i recuperació sense forçar una v1 sobre fitxes resoltes. Separa BD d’Auth/Storage/navegador.
- Proves sobre l’esquema reconstruït: lectura READ ONLY i cobertura, tres casos, zero/null, digital duplicat, propietari ambigu, empremtes canviades, pla bloquejat i verificació posterior amb detecció de dades no autoritzades. Controls pertinents superats, sense Supabase real ni publicació. Els 453 segueixen sent fitxes pendents; els tres criteris estan resolts.

## Plataforma: comprovació final rebuda i pla privat completat

- Informe real validat independentment: totals globals i per propietari, conjunts complets d’IDs, vincles i empremtes. Inclou exemplars i entrades sense any; cap bloqueig ni altre grup de discrepàncies. Els tres casos aprovats tenen un físic i un digital actius i compres físiques coincidents; els buits digitals es conserven.
- Pla per identificadors i lectures prèvia/posterior generats fora del repositori, sense dades personals als documents públics. Primera base real: no hi havia una empremta antiga amb què acreditar absència de canvis històrics. Cap migració ni publicació.
- Recomptes previstos contrastats: es mantenen fitxes, exemplars totals, físics, Bitàcora i propòsits; només tres digitals passen a històrics i es resolen les fitxes pendents. Detall privat i procediment a [PLA-FINAL-PLATAFORMA.md](PLA-FINAL-PLATAFORMA.md).
- ZIP definitiu immediatament abans de la futura aplicació autoritzada, amb edicions pausades i recomprovació per IDs; renovar pla/còpia si canvien dades. Auth/PostgREST, serveis i bytes de Storage, recuperació remota i navegador continuen pendents.

## Plataforma: recuperació persistent, pendent de nova lectura

- Fitxers temporals perduts; informes privats conservats recuperats fora del repositori a `/home/belchi/tsumige-plataforma-privat`, amb carpeta 0700 i fitxers 0600. Decisions aprovades preservades; pla històric explícitament NO VIGENT.
- Nova consulta només de lectura preparada pels IDs coneguts. Cal retornar el resultat, contrastar canvis, confirmar els IDs dels exemplars i completar el pla actual; no reutilitzar empremtes antigues.
- Migració copiada només com a referència NO EXECUTAR; no s’ha trobat un script final d’aplicació i la documentació confirma que no s’havia completat. Pendent de lectura nova, script transaccional amb assercions i proves locals. Cap conversió ni publicació.

## Plataforma: nova lectura validada i pla persistent completat

- Comparació amb referència històrica sense canvis de files, IDs, hashes ni totals. Confirmats els tres parells físic/digital i les compres aprovades; cobertura completa de les quatre taules.
- Pla nou `pla-002.json`, informe i consultes de recomprovació/verificació desats privadament a la carpeta persistent. Cap autorització ni execució de conversions; empremta basada en la lectura nova.
- Pendents: script final transaccional amb assercions i proves, còpia ZIP definitiva prèvia, Auth/Storage/navegador i futura autorització d’aplicació. No s’ha publicat.

## Plataforma: script final transaccional preparat, no aplicat

- Generador sense dades personals i script privat persistent basat en el pla nou: comprovacions d’esquema/RLS/permisos, identificadors, compres, empremtes i totes les files; locks abans de fixar la instantània serialitzable. Migració i conversió en una única transacció amb assercions abans del COMMIT.
- Script complet provat amb esquema públic contrastat i dades sintètiques: només tres digitals deixen el recompte actiu; IDs, compres, comentaris, valoracions, Bitàcora i propòsits preservats. Rollback de dades i DDL davant dades/IDs/RLS canviats i fallada després de convertir; convidat/anònim rebutjats i reexecució bloquejada.
- Lectures prèvia/posterior, manifest i procediment privats preparats. ZIP definitiu i recomprovació immediata abans de la futura aplicació autoritzada; renovar el pla si hi ha canvis. Auth/PostgREST, API/bytes de Storage, navegador i concurrència multiclient real pendents. Cap migració remota ni publicació.
- TypeScript, ESLint, compilació i regressions locals d’esquema, restauració v1/v2, RPC/RLS i timestamps superats; avís de mida de bundle existent. Detall a [PLA-FINAL-PLATAFORMA.md](PLA-FINAL-PLATAFORMA.md).

## Plataforma: còpia d’esquema per recuperació encara incompleta

- L’informe inicial té noms tècnics/ACL i interns de Storage redactats: útil per a validació pública, insuficient com a dump de recuperació. Preparada consulta complementària només de lectura, amb noms/ACL íntegres i omissions de cossos sensibles explícites; resultat privat pendent.
- Cal completar/contrastar les definicions i assajar recuperació; ZIP definitiu amb dades i portades i còpia restaurable d’esquema/dades continuen necessaris. Auth/Storage gestionats no es recuperen només amb aquest informe.
- Corregida la selecció de RPC al generador per signatures públiques sense prefix d’esquema. Prova de RPC modificada rebutjada amb rollback; script privat regenerat amb el guard corregit, sense aplicació remota ni publicació.

## Plataforma: complement d’esquema recuperat, còpia restaurable pendent

- Informe complementari privat desat persistentment en CSV/JSON amb permisos 0600 i SHA-256. Sense omissions ni objectes absents dins l’àmbit; definicions/ACL contrastades amb l’anterior tenint en compte les redaccions.
- Proves de transacció completa repetides sobre aquest esquema amb dades sintètiques; preservació, permisos i rollback superats.
- Permet reconstrucció/assaig de l’esquema d’aplicació i conservar metadades Storage/Auth capturades; no equival a dump restaurable validat ni recuperació integral. Pendent ZIP definitiu amb dades/portades, còpia restaurable de base/esquema/dades i accessos quan pertoqui, integritat i assaig de recuperació. Auth/Storage/navegador reals continuen pendents. No s’ha aplicat ni publicat.

## Plataforma: recuperació acotada provada, exportació original pendent

- Analitzat el script exacte: només estructura/RPC/triggers Plataforma, plataforma/updated_at de fitxes i actiu/updated_at dels tres digitals. Sense canviar Auth, assignacions de convidats, Bitàcora, propòsits o Storage.
- Procediment equivalent de reversió transaccional preparat amb captures de lectura anteriors/posteriors, preservació d’OID/owner/ACL de la RPC original, dades/metadata exactes i protecció contra edicions noves. Materials/eines privats persistents, permisos 0700/0600.
- Prova aïllada sobre esquema contrastat i dades sintètiques superada: aplicar/revertir recupera hashes de dades i esquema/RLS/ACL, timestamps i vincles; reversió incorrecta avorta sense canvis parcials i edició posterior no es sobreescriu. Regressions de la transacció i ESLint superats.
- Pendent SELECT privat de captura dels valors originals reals: sense retornar i verificar aquest resultat no es dona per custodiada la recuperació real. Després cal ZIP definitiu addicional i recomprovació immediata; captura posterior obligatòria després d’una futura aplicació, abans de generar/autoritzar la reversió. No cal recuperar Auth/convidats/Storage per aquesta inversa en la mateixa base; pèrdua externa del projecte continua fora d’abast. Cap execució remota ni publicació.

## Plataforma: originals reals per a reversió verificats i custodiats

- Captura anterior rebuda, CSV/JSON privat persistent 0600; 453 fitxes i tres digitals exactes, dades/esquema coincidents amb el pla i timestamps/camps dels tres casos contrastats. Bundle de reversió completat amb valors originals reals i esquema, manifest de hashes i eines provades.
- Ja no falta l’exportació dels originals. Següent: pausar escriptures, descarregar/verificar ZIP definitiu i recomprovar immediatament per IDs; qualsevol canvi obliga a revisar/renovar pla/captura/material. Autorització d’aplicació pendent.
- Després d’una futura aplicació cal capturar l’estat posterior per generar i autoritzar la reversió executable; cap empremta posterior inventada. No s’ha aplicat ni publicat.
