# Treball pendent

## Entrega: marc de portada i valoracions a la capçalera — 15 d’octubre de 2026

- Criteri vigent que substitueix el detall anterior amb imatge sencera: marc IGDB cover_big 264 × 374 (132:187), object-cover i object-center per a qualsevol origen. Marc compartit en consulta/edició, fitxes amb/sense vincles i fallback sense imatge/error; alçada màxima de 24 rem. No canvien originals ni URL. Font: https://api-docs.igdb.com/#images. Pujada de portades pròpies ajornada.
- Totes les valoracions disponibles A++/A+/A/B/C/D passen a un únic distintiu al costat del títol, també al joc sense vincles i en edició (control editable conservat). A+/A++ mantenen vermell; sense valoració no hi ha distintiu ni espai. Eliminada la representació sota icones; sense tercera columna, sense tocar dades.
- Revisió de dades: Àmbit Dades del joc ofereix Plataforma, Portada, Gènere principal, Valoració i Comentaris; Col·lecció any/preu de compra; log Completat. Sense portada es combina amb la cerca per títol existent; no s’afegeixen filtres nous. Fitxer privat assignat compta com a portada, URL present amb error de càrrega no es considera camp buit, zero euros no és absent. Controls existents de Col·lecció preservats.
- Chromium local, amb dades/imatges sintètiques: 1440×900 i 390×844, Clar/Fosc; portades verticals/panoràmiques, sense imatge/error, qualificacions diferents/absents, títols/comentaris llargs, únic distintiu, accions, marc i absència de desbordament horitzontal. Captures revisades. Filtres comprovats interactuant amb Àmbit/Camp buit i cerca, incloent preu zero. Cap petició externa en aquestes proves.
- Noms Assassin’s Creed (panoràmica), Sekiro i Super Mario Land 2 utilitzats només en fixtures sintètiques; no verificades les fitxes/imatges reals de l’usuari per manca de sessió. Prova física en mòbil i totes les comprovacions manuals ajornades d’altes, Gènere, permisos remots i eliminacions continuen pendents. La revisió sintètica de Configuració al mòbil no equival a donar per resolta la incidència real anterior.
- Entrega inclou la feina local aprovada de redisseny compacte, confirmació d’eliminació, icones externes, correcció del cercador i documents de relleu. TypeScript, ESLint, proves lògiques/SSR, compilació i regressió de navegador abans de publicar. Sense SQL, migracions, dades reals ni bright-worker; materials privats i captures de proves fora de Git. Resultat del desplegament i recursos públics es comunica en acabar.


## Cercador d’Inici: selecció i retorn de focus — 15 d’octubre de 2026

- Causa reproduïda en Chromium amb dades sintètiques i el main tabIndex=-1 realista: pointerdown al LI → blur de l’input amb relatedTarget MAIN → llista desmuntada, sense esdeveniment click ni diàleg. No era una fallada d’IDs ni del layout compacte del detall.
- Correcció mínima: impedir el canvi de focus a pointerdown primari sobre un resultat; la selecció continua exclusivament al click o Retorn. En tancar, restaurar focus després del desmuntatge del diàleg, perquè abans l’input encara era inert. Disposició, enllaços i lògica de dades preservats.
- Regressió executable a tests/browser/home-search.mjs amb fixture sintètica. Chromium escriptori/ratolí i mòbil/tàctil emulat: joc/plataforma correctes, Col·lecció/log, un sol diàleg, focus, teclat, Esc, Tab, clic fora, joc sense vincles i tria explícita d’exemplars. Cap petició externa, cap consulta ni escriptura a Supabase. Playwright/biblioteques preparats fora del projecte, sense dependències noves al package.json.
- ESLint, TypeScript/compilació, dotze fitxers de proves de lògica i renderitzat sintètic superats. Persisteix l’avís existent de mida del JavaScript.
- Pendent confirmació de l’usuari amb les dades accessibles reals, Assassin’s Creed i dispositiu mòbil físic/Safari/Firefox. Aquestes proves de Chromium no acrediten altres revisions visuals, Gènere, altes, permisos remots o eliminacions reals: totes les comprovacions manuals ajornades anteriors continuen pendents. Sense SQL, canvis a Supabase/bright-worker, commit ni desplegament.


## Detall: amplada màxima compacta — 15 d’octubre de 2026

- Ajust local del contenidor de detall normal i de fitxa sense vincles: màxim 1000 px en lloc de 1160 px, mantenint 94vw en pantalles petites. Cap canvi de lògica d’accions, confirmacions, enllaços o dades.
- Distribució interior conservada: columna esquerra clamp(16rem,28vw,20rem), portada de 24 rem d’alt amb object-contain i amplada màxima 20 rem; columna dreta minmax(0,1fr), dades en línia i comentaris només dins d’aquesta columna amb creixement natural. Mateixa mida declarada de portada que abans; una columna al mòbil, sense tercera columna.
- Controls: ESLint, TypeScript/compilació i proves de detall, inclosos màxim compartit de 1000 px, columnes/portada conservades, títols/comentaris llargs i permisos. Comprovació visual real pendent en mòbil/escriptori i Clar/Fosc: equilibri de les columnes, botons amb poc espai, absència de desbordament i mida percebuda de portada. Totes les comprovacions ajornades continuen pendents, inclosos Assassin’s Creed i Revisió de dades al mòbil. Sense SQL, Supabase, bright-worker, commit ni desplegament.


## Icones de cerca externa al detall — 15 d’octubre de 2026

- Substituït l’enllaç textual de MobyGames per la balena oficial i afegida la icona oficial de YouTube: fila centrada just sota la portada, YouTube a l’esquerra/MobyGames a la dreta, abans de valoració i font que es conserven. Imatges de 36 px en àrees de 44 × 44 px, noms accessibles, title, focus visible, pestanya nova i noopener noreferrer. Sense tercera columna ni canvis de mida de portada.
- YouTube cerca títol + plataforma quan és útil + trailer; Steam/Epic Games/itch.io/Emulador no s’afegeixen com si fossin una edició de maquinari. MobyGames conserva la cerca pel títol exacte. Paràmetres codificats; sense API, reproductor, dades noves ni escriptures.
- Recursos oficials locals i transparents, amb procedència a public/icons/PROCEDENCIA.md: icona del web de marca YouTube i balena 48 × 48 del favicon de MobyGames, convertida a PNG sense retall/redibuix. Sense filtres de color per tema ni càrregues d’imatge a tercers durant la consulta del detall.
- Proves de renderitzat per als tres tipus de detall, URL amb accents/caràcters reservats, plataformes útils, ordre, accessibilitat, seguretat i dimensions declarades. Revisió visual real i interaccions pendents en mòbil/escriptori × Clar/Fosc; les comprovacions manuals anteriors, Assassin’s Creed i Revisió de dades al mòbil continuen pendents. Vídeos automàtics i fitxa exacta MobyGames ajornats; bright-worker intacta. Sense SQL, Supabase, commit ni desplegament.


## Cerca a MobyGames i localització d’IGDB — 15 d’octubre de 2026

- Enllaç textual discret «Cerca a MobyGames» al detall de consulta compartit per Col·lecció, log i fitxes sense vincles, sota la portada/valoració/font. Títol codificat amb encodeURIComponent, target _blank i rel noopener noreferrer; sense API, camps nous ni tercera columna. Reutilitza colors i focus del tema.
- bright-worker: referència del client a src/lib/metadata.ts i descripció a ARQUITECTURA.md. Cerca als fitxers accessibles i historial Git sense codi de servidor ni instruccions específiques de desplegament; workflow només de Pages. No s’ha inspeccionat la funció remota ni es conclou que el codi no existeixi fora d’aquest repositori.
- Per continuar amb YouTube cal facilitar el codi font vigent de bright-worker, imports/fitxers auxiliars, configuració de la funció i, si existeix, repositori o instruccions de desplegament. Només noms de variables requerides, mai tokens, claus ni valors de secrets. No substituir ni desplegar la funció abans de revisar-ho.
- Proves sintètiques d’enllaç per als tres tipus de detall, accents/caràcters reservats i proteccions de pestanya; ESLint i TypeScript/compilació. Revisió visual i obertura real en mòbil/escriptori i Clar/Fosc pendents; totes les comprovacions manuals ajornades es mantenen. Cap implementació de YouTube, canvi de Supabase/SQL/RPC, commit o desplegament.


## Detall compacte i confirmació segura — 15 d’octubre de 2026

- Ajust local que substitueix la ubicació inferior de les accions del redisseny anterior: capçalera dreta amb Edita, Elimina el registre i Tanca, segons permisos; en edició, accions existents de desar/desfer al mateix lloc, sense duplicats inferiors. Tanca sempre a la dreta amb la protecció d’esborranys existent. Anterior/Següent continuen només a baix. Mateixa disposició al joc sense vincles.
- Confirmació ja existent conservada i reforçada per a exemplar, entrada i joc: missatge «Segur que vols eliminar aquest registre? Aquesta acció no es pot desfer.», context i explicació del que es conserva, Cancel·la enfocada inicialment/autoFocus, acció destructiva explícita. Esc/tancament cancel·len abans d’enviar; Retorn repetit o dirigit al diàleg no confirma. Una petició ja enviada no es pot desfer cancel·lant. Es conserven RLS/IDs/timestamp/dependències i reconciliació de resposta perduda sense repetir DELETE.
- Comentaris sense separador horitzontal: rectangle amb vora semàntica, cantonades suaus i mínim discret, creixement natural, salts de línia íntegres, sense truncament ni scroll intern. Marges/separacions compactats; portada conservada a 24 rem d’alt, sencera, amb proporcions i dues columnes/escriptori, una/mòbil.
- Controls automàtics: ESLint, TypeScript, compilació i proves de detall/eliminació amb dades sintètiques; confirmació explícita, cancel·lació/Esc/tancament, Retorn, permisos, ordre d’accions, un sol Tanca, portada conservada i comentaris buits/llargs. Proves de callbacks/SSR no acrediten focus ni interaccions natives reals.
- Sense navegador disponible per contrastar les quatre combinacions escriptori/mòbil × Clar/Fosc: revisar alçada/scroll segons finestra, accions amb títols llargs, confirmació i focus amb teclat, Cancel·la/Esc, desar/desfer/tancar amb esborrany, comentaris extensos. Totes les comprovacions manuals ajornades continuen pendents; Assassin’s Creed i Revisió de dades al mòbil no es donen per resolts. Sense SQL, RPC noves, dades reals, YouTube/MobyGames, commit o desplegament.


## Detall: redisseny visual local — 15 d’octubre de 2026

- Dues columnes en consulta a partir d’amplada mitjana: portada a l’esquerra amb columna de 16–20 rem i espai d’imatge estable de 24 rem d’alt; valoració i font existents a sota. Imatge sencera amb object-contain, sense retall ni deformació; dimensions de portada incrementades també en edició. Mòbil en una columna.
- Etiquetes activades agrupades al capdamunt del contingut, abans de portada/dades. Dades en una sola columna amb etiqueta/valor en línia i salts naturals per a textos llargs; comentaris separats a sota, amb amplada de la columna de dades i sense retallar. Títol/plataforma a la capçalera; Edita i accions de desament existents conservades.
- Retirat Tanca superior tant del detall normal com del joc sense vincles. Només Tanca inferior, també en edició, amb les guardes existents; Anterior/Següent continuen només a baix a la dreta.
- Sense tercera columna ni blocs buits: YouTube/MobyGames continuen només com a idees, sense camps ni gestió d’enllaços implementats. Colors semàntics del tema existents reutilitzats.
- Revisió visual real pendent en escriptori/mòbil i Clar/Fosc: portada vertical/panoràmica, títols i comentaris llargs, dades buides/0 €, accions, scroll i consulta/edició. No es dona per resolt el cas Assassin’s Creed ni Revisió de dades al mòbil. Totes les altres comprovacions manuals ajornades del relleu continuen pendents.
- Controls superats: ESLint, TypeScript/compilació i renderitzat sintètic amb comentaris llargs, etiquetes superiors, portada sencera, convidat, camps en línia, un sol Tanca i navegació inferior. Persisteix l’avís existent de mida del JavaScript. Sense navegador disponible, no s’ha comprovat el resultat visual real.
- Canvis exclusivament locals de presentació, sense SQL, migracions, RPC, dades reals, commit o desplegament. Els documents de relleu previs es preserven.


## Relleu verificat — 15 d’octubre de 2026

- Estat vigent resumit a [ESTAT_ACTUAL.md](ESTAT_ACTUAL.md). Les seccions antigues següents són historial; «canvis locals», «no aplicat», «pendent de publicar» o propostes substituïdes no anul·len l’estat vigent.
- Branca main, local/origin alineats en `09a4be16eb176f3a70afdefa2da61121a8fc1d72`, fetch i divergència 0/0. Directori net abans del relleu. [Actions 38638762048](https://github.com/ibelchi/Tsumige/actions/runs/38638762048) correcte; recursos de Pages contrastats amb l’artefacte. No queda publicació d’aplicació pendent; els documents d’aquest relleu queden locals.
- Selector publicat: només sol/lluna, sense text visible ni Sistema, centrat sota Configuració; mòbil i convidats inclosos. Eliminacions independents i neteja de joc sense vincles publicades; Anterior/Següent només a baix a la dreta. Confirmat al codi/proves, no amb interaccions manuals reals.
- Controls repetits: ESLint, TypeScript/compilació, dotze fitxers de lògica i renderitzat sintètic. Cap SQL, migració, reversió ni registre modificat. AGENTS.md creat amb instruccions breus de continuïtat.
- **Totes les comprovacions manuals ajornades continuen pendents**: Gènere; altes de Col·lecció/log; afegir a Col·lecció des del log; permisos d’aquestes operacions; alta fictícia, eliminació independent i neteja final; tema visual i resta de navegació/teclat/retorn/diàlegs no acreditats. Les proves automàtiques no les substitueixen.


## Aparença Clar / Fosc i publicació (14 d’octubre de 2026)

- Selector definitiu centrat sota Configuració al menú lateral, també dins del menú mòbil: només icones de sol (Clar) i lluna (Fosc), sense text visible. Selecció directa, estat actiu destacat, noms accessibles, ajuda al cursor, focus i botons de teclat; disponible per als convidats. Cap selector duplicat a Configuració.
- Preferència local persistent, Clar per defecte. L’antiga preferència Sistema es converteix una vegada a Clar/Fosc segons el sistema d’aquell moment i es desa; després no segueix els canvis del sistema. Sincronització entre pestanyes conservada. Script abans de React per evitar el flaix inicial.
- Variables globals compartides per accés, recuperació, detalls, formularis i confirmacions; adaptats colors de focus, gràfiques, verds, estrelles, valoracions vermelles i estats dels propòsits. Marca/substituts adaptats amb CSS, sense alterar ni filtrar portades.
- Proves automàtiques: dues opcions, persistència, migració de Sistema, Clar inicial, emmagatzematge no disponible, coherència del script inicial i absència de seguiment del sistema; renderitzat propietari/convidat amb un únic selector i eines protegides. TypeScript, ESLint, dotze fitxers de lògica, renderitzat sintètic, PostgreSQL local d’eliminació i compilació. Persisteix l’avís de mida del JavaScript.
- Pendent prova ajornada amb alta fictícia, eliminació independent de l’exemplar de Col·lecció i de l’entrada de log, comprovació del que es conserva i neteja final del joc sense vincles. Totes les altres comprovacions manuals anteriors (Gènere, altes, incorporació des del log, eliminació i navegació) continuen pendents; les proves automàtiques no les substitueixen.
- Revisió visual/interactiva real pendent: contrastos, recàrrega sense flaix, marca/substituts, portades intactes, desplegables/diàlegs i mòbil/escriptori. Publicació autoritzada dels canvis completats; sense dades/esquema/SQL de Supabase ni materials privats. El resultat de GitHub Actions i la comprovació de recursos públics s’informen en acabar, sense donar per comprovades interaccions autenticades.

## Eliminació de registres i navegació inferior (14 d’octubre de 2026)

- Criteri reconfirmat per l’usuari: eliminació definitiva només de l’exemplar o l’entrada oberts, mai retirada ni eliminació en cascada. Confirmacions ampliades per explicitar que portada, valoració i comentaris es conserven amb el joc.
- Validació automàtica ampliada amb dades sintètiques: desaparició de l’ID eliminat i reducció dels recomptes, entrades intactes en eliminar exemplar i exemplars intactes en eliminar entrada; portada/valoració/comentaris preservats. Accés pel cercador a l’altre àmbit i a la fitxa sense vincles; neteja final permesa només després de desaparèixer totes les relacions. Les proves de base de dades són locals amb l’esquema contrastat, no eliminacions reals.
- Totes les comprovacions manuals anteriors continuen pendents; aquestes proves automàtiques no acrediten clics, focus, retorn visual amb filtres, actualització interactiva de recomptes ni presentació mòbil/escriptori.

- Substituït el botó de retirada per Elimina el registre, només per al propietari: al detall de Col·lecció elimina exclusivament l’exemplar obert; al detall del log exclusivament aquella entrada. Es conserven joc, valoració, comentaris, altres exemplars i altres entrades. No es fa cap neteja massiva d’històrics.
- Elimina el joc definitivament només en consulta de fitxa sense cap exemplar (també històric) ni entrada; accessible des del cercador d’Inici o enllaç directe de detall. La presència es comprova al catàleg i el servidor impedeix l’eliminació si hi ha dependències. Fitxers de Storage intactes, inclosos els que podrien continuar referenciats.
- Confirmació separada amb títol, plataforma, ID i explicació del que s’elimina/conserva; botó Cancel·la enfocat inicialment, prevenció de doble execució i protecció dels canvis sense desar. El DELETE es condiciona a ID/propietari/updated_at i, per als registres, també al joc relacionat.
- Resposta perduda: només es rellegeix l’existència després de reconfirmar identitat/permisos. Si no es pot confirmar, Comprova l’estat fa lectures, no reenvia DELETE. Si el registre existeix, es conserva el detall/error i cal una confirmació explícita nova. Eliminació confirmada amb error refrescant la llista només permet reintentar la recàrrega. En èxit, es refresquen catàleg/resums i es torna a l’origen amb els filtres.
- Retirats els controls independents de retirada/reactivació i la pàgina/enllaç Jocs retirats; les URL antigues d’aquesta pàgina redirigeixen a Col·lecció. Històrics i compatibilitat ZIP/CSV/restauració preservats. L’alta tampoc ofereix retirar el digital per substituir-lo pel físic: si ja hi ha un exemplar actiu, ofereix obrir-lo sense crear-ne un altre ni modificar-lo. Les RPC antigues es conserven per compatibilitat, però el client no envia cap petició de retirada. Ajustades les guardes de desament per aplicar duplicats anuals només al log i exemplars actius només a Col·lecció.
- Anterior/Següent només a baix, agrupats a la dreta i amb disposició compacta adaptable. Ordre, filtres, límits i guardes de canvis sense desar conservats; accions superiors de consulta/edició/desament/tancament es mantenen.
- No cal SQL nou segons els tipus i l’esquema/RLS contrastats: permisos DELETE del propietari, restricció pot_editar als convidats, FK exemplar/entrada → fitxa amb ON DELETE RESTRICT i cap trigger DELETE de sincronització de valoració. Reutilitzat DELETE amb aquestes proteccions, sense RPC/migració nova. És contrast amb la captura conservada, no una auditoria administrativa remota nova ni una prova Auth/PostgREST real.
- Controls correctes: TypeScript, ESLint, onze fitxers de proves de lògica, renderitzat sintètic i compilació. Base PostgreSQL local reconstruïda amb metadades contrastades i dades sintètiques: eliminació per ID, RLS de convidats, FK RESTRICT amb només històrics, resta de registres i valoracions/comentaris preservats, joc sense relacions eliminable. Simulades respostes perdudes i reintents només de lectura; controls de convidat ocults i navegació superior absent. Es manté l’avís existent de mida del JavaScript.
- Proves manuals reals de Gènere, altes i incorporació des del log continuen pendents en els casos no acreditats. Per a aquesta tanda cal revisar confirmació/Cancel·la, focus/Esc, doble clic, selecció del registre correcte, resposta perduda, retorn amb filtres, històrics, joc sense vincles i navegació inferior en mòbil/escriptori. No hi ha navegador disponible; no es donen aquestes interaccions reals per comprovades. Cap eliminació real, migració remota o publicació.

## Publicació de Gènere i ordre manual descartat (14 d’octubre de 2026)

- Ordenació manual de Jugant/Per jugar aviat descartada per decisió explícita de l’usuari. No implementar ni preparar SQL/migracions. [PROPOSTA-ORDRE-INICI.md](PROPOSTA-ORDRE-INICI.md) es conserva únicament com a historial descartat; no queda pendent d’autorització. Ordre actual sense canvis.
- Publicació autoritzada dels canvis completats de Gènere i la documentació associada. Cap migració, reversió ni modificació de dades de Supabase; excloure materials privats.
- Controls previs correctes: TypeScript, ESLint, deu fitxers de lògica, renderitzat sintètic i compilació. Comprovats desplegables, deduplicació, valors preservats, permisos de presentació i compatibilitat de filtres/estadístiques/còpies/CSV. Es manté l’avís existent de mida del JavaScript.
- Comprovació manual de Gènere en mòbil i escriptori ajornada: confirmació/cancel·lació, duplicats i desament real del desplegable no es donen per comprovats al navegador.
- L’alta real informada per l’usuari al mòbil es manté com a observació limitada. Proves d’altes encara no verificades, errors, duplicats, permisos i incorporació des del log continuen pendents; les proves sintètiques no les substitueixen. Revisió i compleció de dades/portades ajornada.
- Les notes següents de publicació ajornada o preparació d’ordenació són històriques i queden substituïdes per aquesta decisió.

## Ajornaments i preparació d’ordre manual — historial (14 d’octubre de 2026)

- Comprovació de Gènere en mòbil i escriptori ajornada; les proves automàtiques superades no acrediten confirmació/cancel·lació ni desament real del desplegable al navegador.
- Publicació dels canvis locals acumulats pendent. No publicar en aquesta tanda; les publicacions anteriors es mantenen com a historial, sense donar aquests canvis locals per desplegats.
- Revisió i compleció de dades i portades ajornada; proposta de pujada pròpia encara sense implementar.
- L’usuari ha informat d’una alta real al mòbil amb Gènere lliure. Es conserva aquesta observació concreta, però continuen pendents les comprovacions reals no acreditades: modalitats d’alta, duplicats, errors, dades compartides, permisos, retorn al detall i afegir a Col·lecció des del log.
- Ordre manual de Jugant/Per jugar aviat: anàlisi a [PROPOSTA-ORDRE-INICI.md](PROPOSTA-ORDRE-INICI.md). El model i les RPC contrastats no tenen persistència d’ordre; `resum_jocs` serveix ordre alfabètic. Cal SQL: dues posicions independents per fitxa, desament atòmic restringit al propietari, lectura i manteniment de pertinença perquè nous membres vagin al final, i compatibilitat de còpies. Anàlisi històrica posteriorment descartada: no preparar migracions. Cap alternativa amb localStorage ni interfície d’ordenació implementada.
- Proposta d’interacció: Ordena només per al propietari, tots els jocs visibles, controls Abans/Després aptes per teclat/mòbil, Desa/Cancel·la i convidats en consulta. Els tres primers segueixen l’ordre desat; baixa d’un joc no reordena els altres. Preparació de proves i recuperació descartada amb la proposta. Anàlisi només de codi/captura contrastada, sense consulta remota nova ni dades modificades.

## Gènere: desplegable compartit d’alta i edició (14 d’octubre de 2026)

- Observació de l’usuari: ha fet una alta real des del mòbil i hi ha detectat Gènere com a text lliure. Els inputs de gènere principal eren compartits entre mòbil i escriptori, no una variant mòbil. Es registra aquesta observació concreta, sense donar per superats tots els recorreguts d’alta, duplicats, errors, permisos ni incorporació des del log; la resta de proves manuals continuen pendents.
- Substituïts els inputs de gènere principal en altes de Col·lecció/log, edició explícita de dades compartides i formulari del detall per un únic component accessible de desplegable. Opcions alfabètiques a partir de totes les fitxes accessibles, deduplicades per espais, majúscules i accents; Sense gènere permet null i no es preselecciona cap gènere nou.
- Valor actual preservat exactament, encara que sigui una variant antiga; la deduplicació només afecta les opcions de la interfície, no reanomena ni fusiona dades. Principal continua sent un únic text nullable. Els gèneres secundaris preexistents i el seu model no es modifiquen.
- Afegeix un gènere… només per al propietari: camp separat amb Confirma/Cancel·la, validació de text no buit i detecció de duplicats que selecciona l’opció existent. Retorn confirma, Esc cancel·la només aquest camp i es retorna el focus al selector. Cal confirmar o cancel·lar abans de desar el formulari; seleccionar/confirmar una opció no escriu per si sol a Supabase.
- Catàleg reutilitzat: els valors de genere_principal ja persistits. Una opció nova es desa amb el joc i reapareix en les consultes següents; cancel·lar el joc no crea una categoria independent. No cal SQL ni RPC nova per aquest funcionament. Si es vol un catàleg persistent també per a gèneres sense cap joc, cal una decisió separada i avisar abans de preparar qualsevol SQL; no s’ha implementat.
- Controls correctes: TypeScript, ESLint, deu fitxers de proves de lògica, renderitzat sintètic i compilació. Provats ordre/deduplicació, espais/majúscules/accents, valor antic preservat, gènere buit, nova opció recuperable des de fitxa desada, desplegables en les dues altes i els dos formularis del detall, opció d’alta només del propietari, filtre de Col·lecció, estadístiques i còpies v1/v2/CSV sense canvis. Es manté l’avís existent de mida del JavaScript. Confirmar/cancel·lar i desament real encara necessiten comprovació interactiva.
- Filtres/estadístiques/còpies/CSV conserven la lògica i els valors existents. Revisió visual/interactiva pendent en mòbil i escriptori: selector natiu, addició/duplicat/cancel·lació, focus/teclat, desament/error/desfer i opció recuperada després de recarregar. No hi ha navegador disponible. Cap prova amb dades reals, migració o publicació.

## Publicació dels filtres de Col·lecció (14 d’octubre de 2026)

- Revisats Favorits/Amb infants: excloents, clic sobre l’actiu desactiva, URL antiga normalitzada a Favorits. Combinació amb cerca, plataforma i format conservada; mateix estat a Galeria/Llista i en tornar del detall. Convidats poden filtrar sense escriptures ni canvis de marques.
- Controls previs correctes: TypeScript, ESLint, nou fitxers de proves de lògica, renderitzat sintètic i compilació. Transicions, prioritat de URL antiga, resultats buits, formats/plataformes, propietari/convidat i dues vistes coberts amb dades sintètiques. Continua l’avís existent de mida del JavaScript.
- Les proves manuals reals dels formularis d’alta i d’afegir a Col·lecció des del log continuen ajornades per l’usuari; no es donen per superades. Tampoc s’ha executat verificació visual/interactiva al navegador (teclat, clics, retorn real de detall, mòbil).
- Document de portades pròpies inclòs només com a anàlisi sol·licitada: no aprova ni implementa pujades, RPC, canvis de bucket o SQL. Publicació limitada als canvis aprovats i documentació genèrica; sense materials privats, migracions ni escriptures a Supabase. Les notes de tandes següents són historial i mantenen les limitacions pendents.

## Filtres ràpids excloents de Col·lecció (14 d’octubre de 2026)

- Criteri vigent: Favorits i Amb infants són excloents. Prémer un activa només aquell; tornar a prémer l’actiu els desactiva tots dos. Amb infants substitueix només el text del control, no les etiquetes/tics d’edició dels registres.
- Estat conservat a la URL amb els paràmetres existents. Si una URL antiga conté tots dos filtres, els resultats i controls prioritzen Favorits immediatament i es retira infants amb replace, sense afegir una entrada artificial a l’historial. Alternar vista/detalls conserva l’estat; cerca, plataforma, format i altres filtres no s’esborren.
- Substitueix la intersecció dels dos accessos de la tanda anterior. Botons, icones, fons actiu, aria-pressed i ús amb teclat conservats; propietari/convidat poden filtrar sense editar dades.
- Controls correctes: TypeScript, ESLint, nou fitxers de lògica, renderitzat sintètic i compilació. Provades les transicions cap → Favorits → Amb infants → cap, repetir Favorits → cap, prioritat de Favorits a URL antiga, eliminació de l’altre paràmetre i conservació dels altres filtres/vista. Es manté l’avís existent de mida del JavaScript.
- Revisió visual/interactiva al navegador pendent; no hi ha navegador disponible. Proves manuals d’altes i d’afegir des del log continuen ajornades. Canvis i proposta de portades locals preservats; cap modificació de dades/esquema ni publicació.

## Accessos ràpids de Col·lecció (14 d’octubre de 2026)

- Dos controls compactes sota la cerca: Favorits amb estrella plena ocre i Per jugar amb infants amb icona Baby de Lucide. El filtre d’infants existent es reutilitza i el seu tic anterior es retira per evitar duplicació. Fons verd suau quan és actiu, aria-pressed, focus i botons natius de teclat; controls adaptables amb salt de línia al mòbil.
- Favorits selecciona l’exemplar marcat; infants reutilitza `fitxa.per_infants === true`. S’apliquen en intersecció entre si i amb cerca, plataformes, formats, gènere i la resta de filtres. Els camps ja existeixen al catàleg: no cal SQL. Convidats poden filtrar sense poder editar marques.
- Estat a la URL existent (`favorits=1`, `infants=1`), conservat en Galeria/Llista, detalls i navegació del navegador. Desactivar elimina el paràmetre corresponent; el missatge existent informa si no hi ha resultats i els botons continuen accessibles. Enllaços nets des d’Inici no hereten aquests filtres. Galeria inicial i funcions d’alta/detall sense canvis.
- Controls correctes: TypeScript, ESLint, renderitzat sintètic i compilació. Comprovats Favorits/infants separats i combinats, intersecció amb plataforma/format, mateixes dades en Galeria/Llista, accés de propietari/convidat, desactivació via URL i resultats buits. Es manté l’avís existent de mida del JavaScript.
- Revisió visual/interactiva real pendent: posició sota la cerca, amplades petites, teclat, activar/desactivar, alternança de vista, retorn del detall i enrere/endavant. No hi ha navegador disponible. Proves manuals d’altes i d’afegir des del log encara ajornades. Proposta de portades pròpies i resta del treball local preservats; cap modificació de dades/esquema ni publicació.

## Comprovació de publicació i proposta de portada pròpia (14 d’octubre de 2026)

- Tots/Top complet i ja publicat al commit `b972026`: cap commit nou necessari per l’ajust. Revisats criteris A+/A++, renovació a cada clic, retirada de Favorits/fletxes del quadre i persistència de seleccions per visita. Main local/remot coincidents, workflow de Pages correcte i tots els recursos públics contrastats per HTTP amb l’artefacte del commit, sense diferències. Controls locals repetits: TypeScript, ESLint, vuit fitxers de lògica, renderitzat sintètic i compilació correctes, amb l’avís existent de mida de JavaScript.
- Verificació visual/interactiva real de mòbil, teclat i retorn del detall no executada; no hi ha navegador disponible. Les proves automàtiques no la substitueixen. Proves manuals d’altes i d’afegir des del log continuen ajornades, sense donar-les per superades.
- Anàlisi de pujada manual a [PROPOSTA-PORTADES-PROPIES.md](PROPOSTA-PORTADES-PROPIES.md), només proposta local. Reutilitzables bucket privat, RLS/URL signades i camp portada_fitxer; estat revisat a partir del codi i captura d’esquema contrastada, sense comprovació administrativa nova de Supabase.
- Dependències descobertes: RPC de desament no tracta el fitxer privat i exportació ZIP exclou imatges sense URL externa. Caldria ampliar el desament transaccional (requereix SQL futur, advertit; no preparat ni executat) i adaptar manifest/backup/restauració abans de permetre pujades. No inventar atribucions ni URL i preservar la portada antiga en cancel·lar o fallar. Formats/límit de píxels i enfocament pendents d’aprovació. Sense implementació, migracions o dades reals modificades.

## Revisió prèvia de cercador, atzar i Favorit (13 d’octubre de 2026)

- Publicació autoritzada amb Tots/Top confirmat explícitament per l’usuari: cada clic renova, sense Favorits ni fletxes en aquest quadre. Es mantenen les funcionalitats generals de Favorit.

- Cercador revisat: catàleg accessible complet i cerca local independent dels filtres; dades i vincles per ID, plataformes diferenciades, consulta d’exemplars/log/històrics o fitxa sense inventar registres. Ajustat el tancament quan el focus surt amb Tab i l’estat accessible del desplegable durant càrrega/errors. Cerca i filtre aleatori no escriuen dades; el detall normal conserva permisos i proteccions existents.
- Proves automàtiques correctes: TypeScript, ESLint, vuit fitxers de lògica, renderitzat sintètic i compilació. Coberts accents/majúscules, absència de resultats, fitxes només del log/sense vincle, títols llargs, portada absent i diferents formats, seleccions aleatòries independents/renovació, preferències antigues i estrella compartida abans del nom només amb Favorit. Es manté l’avís existent de mida del JavaScript.
- Comprovacions no executades: interaccions reals de teclat/focus/Esc/clic fora, lectura amb eines d’accessibilitat, amplades petites/solapaments/desbordaments i serveis autenticats reals; no hi ha navegador disponible. El renderitzat sintètic i la revisió del codi no es presenten com a verificació visual o funcional al navegador.
- Proves manuals reals d’altes i d’afegir des del log continuen ajornades per l’usuari, sense donar-les per superades. Cap migració, reversió ni modificació de Supabase forma part d’aquesta publicació.

## Jocs a l’atzar: Tots i Top renoven (13 d’octubre de 2026)

- Criteri vigent: dos botons Tots/Top a la mateixa capçalera que el títol, alineats a la dreta; en mòbil poden passar junts a una segona línia. Indicador actiu, noms accessibles, ajuda i focus conservats. Top substitueix Els millors i conserva A+/A++; Tots conserva el conjunt de fitxes actives amb portada.
- Cada clic renova el filtre corresponent, també si ja és actiu; eliminada la icona de fletxes. Fins a tres fitxes diferents, totes les disponibles si n’hi ha menys; s’evita el mateix conjunt si existeixen alternatives. Les seleccions independents per compte/filtre es conserven en detalls i entre seccions. Actualitzar dades no renova un conjunt vàlid; la conciliació existent només substitueix fitxes no elegibles o completa espais disponibles.
- Retirat Favorits només d’aquest quadre i del seu estat. Preferència antiga favorites normalitzada a all/Tots, sense tocar cap dada de Favorit ni els seus indicadors/tics generals. Sense SQL ni canvis de permisos.
- Controls correctes: TypeScript, ESLint, vuit fitxers de proves de lògica, renderitzat sintètic i compilació. Coberts clics repetits sobre el mateix filtre, renovació independent, conjunts diferents quan hi ha alternatives, 0/menys de tres candidats, preferència favorites antiga normalitzada, Top A+/A++, retirada del control Favorits/fletxes i selecció persistent. Avís existent de mida del JavaScript.
- Pendent de comprovació visual/interactiva real: alineació i segona línia mòbil, clic actiu/inactiu, teclat, retorn de detalls, preferència antiga i resultats buits/reduïts. No hi ha navegador disponible. Proves manuals reals d’altes i d’afegir des del log continuen ajornades. Treball local anterior preservat; cap modificació de dades/esquema ni publicació. Substitueix les notes antigues de tres filtres i renovació amb fletxes.

## Cerca de jocs a Inici (13 d’octubre de 2026)

- Camp únic Cerca un joc a la dreta dels recomptes, ocupant l’espai disponible; passa a sota quan falta amplada. Suggeriments amb títol i plataforma entre totes les fitxes accessibles, també fora de Col·lecció. Cerca local pel títol, sense majúscules/accents, amb el catàleg paginat/cache compartit existent; cap consulta per pulsació ni ús de filtres d’altres pàgines. Sense RPC/SQL nou.
- Selecció vinculada pel ID. Un exemplar actiu obre el seu detall en consulta; diversos ofereixen el selector existent. Sense actius s’ofereixen les entrades del log (selector si diverses); si només hi ha històrics es consulten aquests, sense reactivar-los. Una fitxa sense registres vinculats té consulta de dades del joc amb el component de lectura existent, sense crear exemplar/entrada fictici. Propietari/convidat segons permisos actuals; seleccionar no desa ni modifica res.
- Combobox amb noms accessibles, llista d’opcions, fletxes, Retorn, Esc i clic fora. L’opció de teclat es manté visible al fer scroll. Cerca buida sense suggeriments, missatge de cap resultat, càrrega i error amb reintent. Detalls sobre Inici sense alterar els altres quadres; el detall existent conserva protecció de canvis sense desar.
- Controls correctes: TypeScript, ESLint, vuit fitxers de proves de lògica, renderitzat sintètic i compilació. Coberts cerca buida/sense resultats, accents/majúscules, fitxes fora de Col·lecció, noms iguals/plataformes diferents, resolució per ID amb actius/log/històrics/cap vincle, camp accessible per propietari/convidat i consulta de fitxa sense formulari. Avís existent de mida del JavaScript.
- Revisió real pendent al navegador: amplades i mòbil, teclat/scroll, Esc/clic fora, càrrega/reintent, selectors amb diversos exemplars/anys, consulta sense vinculacions, retorn i permisos de convidat. No hi ha navegador disponible. Proves manuals reals d’altes i d’afegir des del log encara ajornades. Canvis anteriors preservats; cap modificació de dades/esquema ni publicació.

## Estrella de Favorit a Col·lecció (13 d’octubre de 2026)

- Indicador compartit en Galeria, Llista i detall: estrella plena de Lucide, 20 px, ocre #996515 sobre fons clar. A l’esquerra del títol i alineada amb la primera línia; mida fixa, sense comprimir-la amb noms llargs. Nom accessible Joc favorit, sense aparença ni acció de botó. No es renderitza ni reserva espai si Favorit està desactivat.
- Favorit continua sent el camp de l’exemplar; no es canvia el model, ni els permisos, ni el tic d’edició. A+/A++ mantenen el vermell. Canvis locals anteriors preservats, inclosos els filtres aleatoris.
- Controls correctes: TypeScript, ESLint, set fitxers de proves de lògica, renderitzat sintètic i compilació. Comprovats nom accessible, estrella plena abans del títol, mida fixa, presència només amb Favorit, noms llargs i valoracions vermelles. Es manté l’avís existent de mida del JavaScript.
- Revisió visual real pendent: alineació i contrast en Galeria/Llista/detall, títols llargs, escriptori/mòbil i lectura accessible. No hi ha navegador disponible. Proves manuals reals d’altes i d’afegir des del log continuen ajornades. Cap modificació de dades/esquema ni publicació.

## Filtres de Jocs a l’atzar (13 d’octubre de 2026)

- Criteri ara aprovat i implementat: Tots (fitxes amb exemplar actiu i portada), Els millors (valoració única del joc A+/A++) i Favorits (almenys un exemplar actiu relacionat marcat Favorit, independentment de la valoració). Exclosos històrics sense exemplar actiu, Emulador i jocs sense portada. Sense SQL: el catàleg ja consulta valoració i Favorit amb els permisos existents.
- Controls compactes sota el títol, disposició adaptable, estat actiu verd, aria-pressed, botons natius amb teclat i focus visible. Últim filtre desat al navegador amb localStorage; Tots per defecte. Fins a tres fitxes diferents per filtre, sense barrejar resultats; missatge breu si és buit i renovació desactivada si no hi ha candidats.
- Selecció independent per compte/filtre en memòria de la visita, conservada en detalls i entre seccions. Tornar a un filtre recupera els seus jocs vàlids; només es substitueixen els que han deixat de complir-lo. La renovació manual actua únicament sobre el filtre actual i evita el mateix conjunt quan hi ha alternatives. Una recàrrega completa pot renovar les portades; enllaços al detall, imatges senceres i permisos de consulta de convidats conservats.
- Controls correctes: TypeScript, ESLint, set fitxers de proves de lògica, renderitzat sintètic i compilació. Coberts A+/A++, favorit sense valoració, no favorits, exemplars múltiples/històrics, manca de portada, Emulador, resultats buits/reduïts, seleccions independents, renovació i substitució parcial. Comprovats controls accessibles, preferència llegida, enllaços i absència de barreja entre filtres. Es manté l’avís existent de mida del JavaScript.
- Revisió visual/interactiva pendent al navegador: controls en mòbil/escriptori, teclat, canvi i retorn de filtre, navegació/detalls, recàrrega i preferència, renovació i canvis d’elegibilitat. No hi ha navegador disponible. Proves manuals reals d’altes i d’afegir des del log encara ajornades per l’usuari. Cap modificació de dades/esquema ni publicació. Les notes anteriors que deixaven aquests filtres com a proposta queden substituïdes per aquesta autorització.

## Publicació de les tandes locals acumulades (13 d’octubre de 2026)

- Estat vigent revisat: recomptes compactes; Jugant/Per jugar aviat amb tres primers i desplegament independent persistent; propòsits i Jocs a l’atzar amb renovació manual persistent; estadístiques al final, tres icones i màxim cinc anys disponibles sense desplegament. Galeries i detall adaptables conservats; Llista amb miniatures i valoracions.
- Acció d’afegir des del log preparada amb la RPC existent, fitxa/ID/plataforma fixats i històrics preservats. Proves manuals reals dels formularis d’alta i d’aquesta incorporació encara pendents per ajornament de l’usuari; aquesta publicació autoritzada no les dona per superades.
- Controls de client correctes: TypeScript, ESLint, set fitxers de proves de lògica, renderitzat sintètic, compilació i prova PostgreSQL local d’altes atòmiques amb esquema contrastat i dades sintètiques (preservació de fitxa/log/històrics, zero/buit, duplicats, reintents, rollback i permisos). Es manté l’avís existent de mida del JavaScript. Publicació de codi sense SQL, migracions, reversions ni dades reals; materials privats exclosos.
- Pendent de verificació visual/interactiva independent al navegador, especialment mòbil, teclat, persistència i altes/errors autenticats; les proves sintètiques no la substitueixen. Les seccions següents són historial de tandes; preval el criteri final de cinc anys sense desplegament.

## Inici: només cinc anys disponibles (13 d’octubre de 2026)

- Criteri vigent: Jocs jugats per any mostra únicament els cinc anys més recents amb entrades amb any indicat, o els disponibles si n’hi ha menys. Es calcula primer el recompte complet d’un joc per any; no es limiten els anys de la consulta.
- Retirats els botons +N anys/Mostra’n menys i l’estat de desplegament dels anys. Substitueix el desplegament aprovat en la tanda anterior. Conservades les tres icones, la preferència de visualització, la disposició d’Inici i els enllaços al log per any. Estadístiques completa i filtres del log sense límits nous; desplegament de Jugant/Per jugar aviat conservat.
- Controls: TypeScript, ESLint, set fitxers de proves de lògica, renderitzat sintètic i compilació correctes. Comprovats zero/menys de cinc/cinc/més de cinc anys, anys no consecutius, recompte únic joc/any, absència de desplegament i enllaços; la funció d’Estadístiques completa conserva tots els anys. Avís existent de mida del JavaScript.
- Proves manuals reals d’altes i d’afegir des del log continuen ajornades per l’usuari. Verificació visual/interactiva al navegador pendent; no hi ha navegador disponible. Sense modificacions de dades/esquema ni publicació.

## Anys disponibles a Inici i miniatures a Llista (13 d’octubre de 2026)

- Inici calcula tots els anys disponibles del catàleg amb el recompte existent d’un joc per any, excloent entrades sense any. Mostra els cinc anys més recents amb entrades, sense limitar-se als anys naturals anteriors ni inventar files buides. Substitueix el criteri de cinc anys naturals de la tanda inicial.
- Amb més de cinc anys: +N anys dins del mateix quadre desplega la resta i Mostra’n menys torna als cinc primers; nom accessible, aria-expanded/controls i focus conservats. Estat durant la visita separat per compte, persistent entre seccions/detalls i canvis de visualització. Sense botó amb cinc anys o menys. Les tres icones, preferència, enllaços per any i disposició aprovada es mantenen. La pàgina Estadístiques conserva tots els anys i el càlcul anterior.
- Vista Llista de Col·lecció: miniatura de 40 × 56 px amb imatge sencera i proporcions intactes; logo discret si manca o falla. Títol multilínia, plataforma/format en una única línia que pot partir-se, regió i indicadors existents conservats, valoració quan existeix amb A+/A++ vermelles. Cap acció de retirada/eliminació a les files. Galeria inicial, preferència, filtres i navegació sense canvis.
- Controls correctes: TypeScript, ESLint, set fitxers de proves de lògica, renderitzat sintètic i compilació. Coberts zero/menys de cinc/cinc/més de cinc anys, anys no consecutius, duplicats del mateix joc/any, ordre descendent, absència/presència de botó, desplegament persistent i enllaços dels anys antics. Files amb títol llarg, portada absent/vertical/panoràmica i valoració present/absent; no hi ha controls destructius. Es manté l’avís existent de mida del JavaScript.
- Revisió visual/interactiva pendent: gràfica plegada/desplegada, retorn entre seccions, teclat i enllaços; files en escriptori/mòbil, títols molt llargs, portades panoràmiques/verticals, fallback d’imatge i absència de desbordament. No hi ha navegador disponible per executar aquestes comprovacions. Proves manuals reals d’altes i d’incorporar a Col·lecció des del log continuen ajornades per l’usuari, sense donar-les per superades. Sense SQL, modificació de dades reals ni publicació.

## Inici: estadístiques al final (13 d’octubre de 2026)

- Proposta aprovada implementada: físics/digitals tornen a ser dos quadres compactes de mida pròpia, junts i alineats a l’esquerra, amb xifres i enllaços per format. Substitueix la disposició de la tanda anterior de recomptes units i gràfica a la dreta.
- Jugant/Per jugar aviat en dues columnes des de 768 px, amb alçades independents. Inicialment es conserven només els tres primers en l’ordre existent; +N desplega tots i − torna als tres primers. N compta els amagats, amb nom accessible i aria-expanded/controls. L’estat es conserva en memòria durant la visita, separat per compte i quadre, també després d’obrir un detall/desmuntar Inici.
- Amb jocs, alçada mínima coherent de 26 rem només en escriptori; el contingut pot créixer i no es retalla. Sense jocs o durant la càrrega no es reserva aquesta alçada. Mòbil amb alçada natural i distribució segons el contenidor; portades senceres, títol/plataforma a sota, grups d’un/dos jocs centrats sense ampliar-los per omplir una fila, enllaços conservats.
- Després: propòsits actuals a l’esquerra, amb llegenda i gestió segons permisos, i Jocs a l’atzar a la dreta, amb selecció persistent i renovació existents. Estadístiques al final a tota l’amplada.
- Estadístiques: tres botons d’icona de selecció directa (calendari/medalla/barres), amb opció activa sobre verd suau, aria-pressed, nom accessible, ajuda, focus i activació nativa amb teclat. Preferència del navegador, càlculs i enllaços conservats; sense dependències, SQL ni canvis de permisos.
- Controls correctes: TypeScript, ESLint, set fitxers de proves de lògica, renderitzat sintètic i compilació. Coberts 0/1/2/3/5 jocs, ordre i límit inicial, +N/− accessible, desplegament independent i persistent després de desmuntar, absència d’alçada mínima per a quadres buits, ordre dels quadres, recomptes/enllaços, tres selectors amb estat actiu, preferència desada i consulta de convidat. Es manté l’avís existent de mida del paquet JavaScript.
- Verificació visual/interactiva real pendent: una/dues columnes, fins a tres portades per fila quan hi hagi espai, +N/−, alçada independent i natural al mòbil, retorn dels detalls, botons d’estadístiques i persistència després de recarregar. No hi ha navegador disponible. Proves manuals reals d’altes i d’incorporar a Col·lecció des del log encara ajornades per l’usuari, sense donar-les per superades. Cap dada/esquema real modificat ni publicació.

## Recomptes d’Inici i estadístiques variables (13 d’octubre de 2026)

- Un únic quadre de recomptes a la columna esquerra, sobre Jugant, amb físics i digitals diferenciats i enllaços nets de filtres residuals. Quadre d’estadístiques a la dreta; alçades ajustades al contingut amb `items-start`. Una columna en pantalles estretes; resta de quadres i funcions conservats.
- Tres visualitzacions amb títol sempre visible: jocs jugats en l’any actual i els quatre anteriors (un joc/any, zeros explícits i sense entrades sense any), valoracions úniques amb els criteris d’Estadístiques, i cinc plataformes amb més exemplars actius dels dos formats. Reutilitzats `statistics` i el component de barres extret de la pàgina d’Estadístiques, sense dependències ni RPC/SQL nous. Empats de plataformes resolts amb l’ordre alfabètic existent; no s’inventen recomptes ni barres positives per a zeros.
- Botó d’icona de 44 px, nom accessible, focus i ajuda amb la següent visualització. Preferència desada a localStorage del navegador; per defecte, jocs jugats per any. Si Storage no està disponible, el canvi continua funcionant durant la visita. Barres enllaçades al log per any, valoracions o Col·lecció per plataforma. Lectura amb sessió i permisos existents, també per als convidats; errors/càrrega/absència de dades diferenciats.
- Controls correctes: TypeScript, ESLint, set fitxers de proves de lògica, renderitzat sintètic i compilació. Comprovats jocs únics/any, cinc anys exactes, zeros i anys exclosos, valoracions úniques, actius/retirats, empats deterministes, consulta de convidat, preferència carregada, noms accessibles i enllaços codificats. Es manté l’avís existent de mida del JavaScript superior a 500 kB.
- Pendents de comprovació real al navegador: disposició amb menú lateral i mòbil, alçades independents, títols/plataformes llargs, botó amb teclat, persistència després de recarregar i destinació dels enllaços. No hi ha navegador disponible per executar aquesta verificació visual/interactiva.
- Proves manuals reals d’altes i d’afegir a Col·lecció des del log continuen ajornades per l’usuari. No es donen per superades. Cap dada real modificada ni publicació.

## Incorporar a Col·lecció des del log (13 d’octubre de 2026)

- Acció «Afegeix a la col·lecció» a les targetes sense exemplar actiu, només per al propietari i excloent Emulador. Formulari amb fitxa/ID/plataforma fixats i dades del joc en consulta, sense editar valoració, comentaris ni entrades de log. Cal confirmar format i dades de l’exemplar abans de desar; camps buits preservats i 0 € admès.
- Reutilitzada la RPC `alta_registre` ja aplicada: no cal SQL ni migració. Comprovació fresca d’exemplars actius abans d’enviar, bloqueig immediat contra doble enviament i reintents pel mateix ID. La RPC serialitza les altes i revisa exemplars actius dins la transacció; si un altre client ja n’ha creat un, no es crea un duplicat ni es retira automàticament. Els errors conserven l’esborrany.
- Amb només exemplars històrics, s’informa explícitament que es crearà un exemplar nou; els antics continuen inactius i conserven les compres. No s’ha automatitzat cap reactivació o conciliació; una possible acció específica de recuperar un històric queda fora d’aquesta tanda.
- Desament correcte: detall de l’exemplar en consulta i catàleg actualitzat; en tornar, la targeta ofereix «Col·lecció». Any, cerca i filtres del log es mantenen. Zona inferior d’accions amb espai i alçada coherents, també per a convidats i Emulador; «Entrada de log» i acció de Col·lecció són botons separats. Galeria 1/2/3, imatges senceres, títols multilínia i A+/A++ vermelles conservats.
- Controls correctes: TypeScript, ESLint, sis fitxers de proves de lògica, proves de renderitzat (propietari/convidat, Emulador, actius/històrics, formulari fixat, accions no imbricades) i PostgreSQL local amb esquema contrastat/dades sintètiques. Verificada la preservació exacta de fitxa, comentaris, valoració, entrades i compres històriques en afegir un exemplar, amb 0 €/any buit, duplicats/reintents i permisos. Compilació correcta; continua l’avís existent de paquet JavaScript superior a 500 kB.
- Revisió al navegador pendent: alineacions i espais amb/sense exemplar, portades verticals/panoràmiques, una/dues/tres columnes amb menú, teclat, obrir/cancel·lar/desar, 0 €/buit, errors, retorn amb filtres i permisos de convidat. No hi ha navegador disponible; el renderitzat sintètic no verifica interaccions visuals ni concurrència real entre clients. Les altes manuals reals ajornades continuen pendents. Cap dada real modificada ni publicació.

## Publicació de les tandes completades — 13 d’octubre de 2026

- RPC d’altes i normalització de noms aplicades una vegada i validades amb el rebut post-COMMIT; no repetir migracions ni executar reversions. Material privat de recuperació custodiat fora del repositori.
- Proves manuals d’altes noves encara pendents perquè l’usuari no té registres reals per incorporar. No es donen per superades i s’han de recordar abans de publicar; l’usuari autoritza publicar sense bloquejar-ho només per aquest motiu.
- Es publiquen nomenclatura log, formularis d’alta, noms canònics, renovació/estabilitat dels jocs a l’atzar, accessos físic/digital, neteja d’eines temporals, galeries adaptables de Col·lecció/log i detall ampliat. Cap aplicació de SQL forma part de la publicació.
- Pendents: revisió visual real de les darreres tandes, interaccions autenticades i altes noves, Auth/Storage API, recuperacions remotes i concurrència multiclient. Les confirmacions visuals prèvies de l’usuari es mantenen limitades als canvis que va comprovar.
- Controls previs a aquesta publicació correctes: TypeScript, ESLint, sis fitxers de proves de lògica, renderitzat sintètic, tres proves PostgreSQL locals (altes/permisos, tanda conjunta/recuperació i Game Boy/restauració v1-v2) i compilació. Es manté l’avís de paquet JavaScript superior a 500 kB. GitHub Actions executa també les noves proves.
- Les seccions següents documenten les tandes i la preparació històrica; l’estat aplicat anterior preval sobre notes antigues de dependències RPC/noms pendents.


## log en galeria (13 d’octubre de 2026)

- Decisió confirmada: el log es presenta en galeria, substituint el criteri anterior de vista llista. Es mantenen anys destacats del més recent al més antic i els filtres any → cerca → plataformes, sense selector d’ordre A–Z ni recompte global d’entrades. Entrades sense any fora de la vista principal, preservades.
- Targetes compartides amb Col·lecció: portada sencera a l’esquerra, títol/plataforma/valoració i estat de completat quan existeix a la dreta. A+ i A++ en vermell. Un estat absent no es presenta com a «No». Mateixos llindars d’amplada útil: una columna, dues des de 41 rem i tres des de 62 rem, descomptant menú i padding.
- Acció principal «Entrada de log» obre el detall de l’entrada; acció separada «Col·lecció», només amb exemplars actius relacionats per ID. Un exemplar obre directament el detall; diversos mostren el selector existent, sense elecció arbitrària. Botons separats, sense enllaços imbricats. Filtres preservats mentre es consulten els detalls; permisos i formularis d’alta sense canvis.
- Controls correctes: ESLint, TypeScript i compilació, sis fitxers de proves de lògica i proves de renderitzat sintètiques. Comprovats anys descendents, filtres en l’ordre acordat, entrades sense any excloses, completat buit, valoració vermella, targetes amb portades de diversos formats, botons sense imbricació i accés a Col·lecció amb zero/un/diversos exemplars. Es manté l’avís existent de mida del paquet JavaScript.
- Pendents visuals: targetes/anys en escriptori i mòbil, títols llargs, portades verticals i panoràmiques, teclat i retorn dels detalls. No hi ha navegador disponible per verificar aquestes interaccions. Les proves funcionals reals d’alta continuen ajornades per l’usuari i s’han de recordar abans de publicar. Cap canvi de dades/esquema de Supabase ni publicació.

## Detall més ample i compacte (13 d’octubre de 2026)

- Quadre adaptat a la finestra, fins a 1.160 px d’amplada i 94 % de l’alçada disponible, amb scroll vertical quan cal. En escriptori: portada a l’esquerra, valoració centrada sota la imatge i font a sota; dades, etiquetes activades i comentaris agrupats a la dreta. Dades repartides en fins a tres columnes internes, amb separacions més compactes i tipografia conservada.
- En pantalles de menys de 768 px, portada i dades en una columna; portada limitada a 16 rem d’amplada, sense deformació ni retall. Títols, dades i comentaris llargs es poden partir en diverses línies. Cap garantia d’absència de scroll amb contingut llarg o poca alçada.
- Conservades les zones pròpies del títol/favorit i dels botons, navegació superior/inferior, tots els camps, Configuració desplegable i proteccions actuals de permisos/canvis sense desar. Cap canvi en les operacions de desament o les dades de Supabase.
- Verificació amb dades sintètiques: comentaris llargs íntegres, només etiquetes actives, ordre portada/valoració/font, absència de valoració, estrella accessible, convidats sense formulari/Edita i navegació duplicada conservada. ESLint, TypeScript, compilació i proves de renderitzat correctes; es manté l’avís existent de paquet JavaScript gran.
- Pendent de revisió visual real: escriptori i mòbil, títols llargs, formats de portada, finestra de poca alçada, scroll, camps d’edició i Configuració desplegada. No hi ha navegador disponible en aquest entorn. Les proves reals dels formularis d’alta continuen explícitament ajornades per l’usuari; recordar-les abans de publicar i no donar-les per superades. Canvis locals, sense publicació.

## Galeria de Col·lecció i proves d’alta ajornades (13 d’octubre de 2026)

- Galeria ajustada a l’amplada útil del contenidor, després del menú lateral i dels marges interiors: una columna en espais estrets, dues des de 41 rem i tres des de 62 rem. Als llindars, cada targeta disposa de 20 rem com a mínim. Les notes històriques que deixaven les tres columnes com a proposta queden substituïdes per aquesta implementació autoritzada.
- Es mantenen portada a l’esquerra i dades a la dreta, imatges senceres amb proporcions conservades, valoracions destacades, accés al detall, Galeria inicial, preferència Llista/Galeria i filtres. Títols i plataformes poden ocupar diverses línies, també amb paraules molt llargues.
- L’usuari ha ajornat les comprovacions funcionals reals dels formularis d’alta. Continuen pendents i s’han de recordar explícitament abans de publicar; la validació de les RPC i les proves sintètiques no les substitueixen ni les donen per superades.
- Controls correctes: ESLint, TypeScript i compilació, sis fitxers de proves de lògica i les proves de renderitzat dels formularis d’alta. Comprovat el CSS generat amb els llindars de contenidor; continua l’avís existent de paquet JavaScript superior a 500 kB. Les proves de renderitzat no són una comprovació visual ni una alta real.
- Revisió visual pendent al navegador: una, dues i tres columnes amb menú lateral, finestres estretes i mòbil; títols llargs, portades verticals/panoràmiques i valoracions. No hi ha navegador disponible en aquest entorn per comprovar el resultat renderitzat. No s’han modificat dades ni esquema de Supabase ni publicat.

## SQL Editor: tanda d’altes i noms compactada (13 d’octubre de 2026)

- Tanda compacta aplicada una vegada per l’usuari i rebut post-COMMIT validat: `verificat=true`, cap diferència imprevista, 123 fitxes normalitzades i RPC d’altes presents amb definicions contrastades (només diferències CRLF de presentació). Totals: 453 fitxes, 440 exemplars, 437 actius (218 físics i 219 digitals), 3 històrics, 202 entrades, 4 propòsits; 122 entrades sense any i exemplars preexistents preservats. Rebut temporal amb ACL exclusiva de `postgres`; sense permisos de PUBLIC, anon, authenticated ni service_role. Reversió completa retornada contrastada amb la plantilla aplicada i les captures reals; custòdia privada, sense execució. Es poden reprendre les edicions i provar els formularis locals; la reversió protegida rebutjarà canvis posteriors. Pendents de comprovació funcional al navegador: altes Col·lecció/log, duplicats, dades compartides, any obligatori, Emulador, convidats i protecció de canvis sense desar. No repetir l’aplicació; cap publicació en aquesta tanda. No s’han comprovat Auth/Storage API ni concurrència multiclient real.

- Investigació posterior del diagnòstic: el resultat `dades_coincideixen=false` era una diferència de representació, no una diferència de valors acreditada. L’empremta esperada es calculava després de `JSON.parse`/`JSON.stringify`, que elimina zeros decimals finals; PostgreSQL conserva aquesta escala en `jsonb::text`. La captura CSV original reprodueix exactament l’empremta remota. Igualtat `jsonb` completa entre CSV, captura desada i pla comprovada localment; esquema coincident i RPC noves absents segons el resultat remot. No cal una exportació addicional per explicar aquest resultat. Pla, ZIP i scripts originals intactes; informe explicatiu custodiat privadament. Les guardes del script compacte comparen valors `jsonb`, no empremtes del text, i continuen protegint les dades. Cap aplicació executada; qualsevol edició posterior continua subjecta a les guardes transaccionals.

- L’intent amb el script revisat ha estat rebutjat per mida. El codi oficial del SQL Editor comprova el límit abans de fer la petició; això explica l’avís, però encara no s’ha consultat l’estat real del projecte després de l’intent.
- Generador `scripts/altes-noms-compact.mjs`: elimina tretze còpies literals redundants; conserva totes les guardes de dades/esquema/permisos, la transacció única, la verificació i la reversió completa retornada després del COMMIT. Captura inicial carregada una vegada en una taula temporal privada, eliminada al COMMIT; ACL explícites i comprovació d’accés efectiu abans de carregar dades.
- Script privat compactat: 910.373 bytes, davant dels aproximadament 2,57 MB anteriors. Preparada consulta privada de lectura per contrastar dades/esquema amb el pla i confirmar l’absència de les RPC noves. No s’han regenerat el pla ni la captura inicial.
- Proves locals amb esquema contrastat i dades sintètiques: aplicació, reversió exacta, errors transaccionals, permisos insegurs de taula/columna i col·lisions. ESLint i compilació correctes; continua l’avís de mida del paquet JavaScript. Pendents: resultat de la consulta remota de lectura i execució real del script compactat al SQL Editor. Cap aplicació ni publicació executada per l’assistent.
- El script compactat cap al límit conegut; no cal instal·lar ni configurar psql ara. Si l’editor imposa un altre límit, executar el mateix batch íntegre amb psql i TLS, sense dividir la transacció.

## Estat actual de Plataforma i publicació

- Conversió del pla 002 aplicada una vegada per l’autor i verificada amb informes posteriors: `coincideix=true`, cap diferència, cap fitxa pendent i només els tres digitals aprovats fora del recompte actiu. Identificadors, compres, comentaris, valoracions, vincles, log i propòsits preservats. No repetir la migració.
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
- Plataforma única sota el nom, sense tipus interns: Steam, Epic Games, itch.io, PC, consoles i Emulador al mateix nivell. Diferents plataformes són diferents registres de joc, sense fusió per títol; físic/digital independent i noves opcions de text. Epic es normalitza a Epic Games. Emulador només al log; a la mateixa consola només compta el físic si també hi ha digital, després de revisar discrepàncies.

## Pendents de revisió o decisió

- Revisar visualment la galeria del log implementada: distribució, tipografia, densitat d’informació i adaptació al mòbil. La decisió de galeria substitueix el criteri anterior de llista; la validació visual real continua pendent.

Les propostes següents no estan aprovades per implementar-les.

- Revisar la distribució del detall i reduir el control de valoració, amb una ubicació adequada.
- Auditoria local del detall completada a [AUDITORIA-DETALL.md](AUDITORIA-DETALL.md). Pendent de contrastar l’esquema real de Supabase i decidir les correccions, omissions i camps condicionals; no assumir que tots s’han de mostrar.
- Primera versió de Revisió de dades implementada localment a Configuració; criteris i exclusions a [REVISIO-DADES.md](REVISIO-DADES.md). Pendent de revisió visual i de decidir els camps condicionals, l’any de joc, la conciliació de notes/valoracions i el detall de fitxes sense registres vinculats.
- Formularis d’alta: implementació completada i RPC aplicades i validades. Proves manuals d’altes noves pendents perquè no hi ha registres reals per incorporar; no bloquegen aquesta publicació. Vegeu PROPOSTA-ALTES.md.
- Nomenclatura confirmada i implementada: «log», sempre en minúscules, i «entrada de log».
- Plataforma: pla 002 aplicat i verificat, tal com indica l’estat actual; no repetir-lo. Els canvis posteriors de noms tenen preparació separada a [NOMS-PLATAFORMES.md](NOMS-PLATAFORMES.md).
- Revisar la vista llista de Col·lecció, inclosa una possible miniatura al costat del nom.
- Possible pujada de portades pròpies. La presentació d’imatges panoràmiques s’ha ajustat en la segona tanda; queda pendent de revisió visual.
- Validar visualment els llindars de dues i tres columnes de Jugant i Per jugar aviat, amb portades grans, títol i plataforma a sota (implementació autoritzada en la segona tanda).
- Ordenació manual de Jugant i Per jugar aviat descartada el 14 d’octubre; es manté l’ordre actual.

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
- Anterior/Següent, Tanca, Esc i l’accés a la col·lecció des de log protegeixen els canvis pendents amb les opcions Desa i continua / Descarta i continua / Continua editant. S’afegeix l’avís natiu en recarregar o sortir de la pàgina. Durant el desament es bloquegen les accions; si falla el desament o la recàrrega, es conserva l’esborrany i es mostra l’error.
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
- El desament conserva explícitament el valor existent de `revisat` en exemplars i entrades de log. El camp es manté als tipus, còpies ZIP, CSV i restauració; cap migració ni canvi de dades. Les funcions de consulta, edició i navegació es conserven.
- [Auditoria del detall](AUDITORIA-DETALL.md) completada amb inventari separat de joc, col·lecció i log: camps visibles, editables, condicionals, absents i tècnics. Només codi/tipus/migració locals; l’esquema real i les definicions dels RPC no estan disponibles per a aquesta inspecció.
- Discrepàncies principals: Favorit és d’exemplar i no es pot marcar als jocs sense exemplar; sinopsi i gèneres secundaris no apareixen al detall; valoracions/notes antigues conviuen amb els camps compartits; Jugant actua sobre el conjunt del joc. Per jugar amb infants és un camp de joc i sí que és editable des de log encara que el joc no es posseeixi.
- Documentada la proposta de Revisió de dades, sense implementar-la. Pendent de decidir Favorit de joc/exemplar, camps absents/condicionals i àmbits/selector/actualització de resultats de l’eina. Les propostes no s’han donat per aprovades.
- Controls: TypeScript, ESLint, compilació, proves existents i comprovacions aïllades amb dades sintètiques de consulta/edició/navegació i preservació de true/false de `revisat`. Sense navegador real: pendent de verificació visual. Sense escriure a Supabase ni publicar.

## Revisió de la interfície

- Continuar refinant el detall dels jocs i la presentació del log.
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

- Instal·lació PWA descartada. El descart antic del mode fosc queda substituït pel tema Clar/Fosc implementat i publicat.
- Filtre físic/digital per any; es mantenen els de plataforma i gènere.

## log: accés al detall de Col·lecció (canvis locals)

- L’accés utilitza exclusivament `joc_id` i l’identificador de l’exemplar, mai coincidències de títol. Només considera exemplars actius.
- Un exemplar: obre directament el seu detall en consulta, amb portada i les dades disponibles. Diversos: ofereix una selecció amb format, regió, botiga, conservació, compra, preu i identificador per distingir fins i tot duplicats. Cap exemplar: no mostra cap enllaç a resultats buits; el detall de log continua accessible.
- Tanca/Esc del detall de Col·lecció torna al detall de log. La llista original continua muntada: conserva any, cerca, filtres i ordre de navegació. No es canvia la ruta ni s’escull un exemplar arbitràriament.
- Es conserven els permisos dels convidats i la confirmació dels canvis pendents, també abans de seleccionar un exemplar i en tancar-ne el detall.
- Verificació amb dades sintètiques: zero, un i tres exemplars; exclusió de retirats i d’un joc amb un altre identificador; selecció explícita, retorn, propietari/convidat i protecció dels canvis pendents. Regressions de consulta, edició, desament, error i navegació superades. TypeScript, ESLint, compilació i proves existents superades.
- Sense navegador disponible: pendent de comprovar focus i obertura/tancament dels diàlegs reals, selecció en mòbil/escriptori i conservació visual dels filtres. La comprovació aïllada no substitueix aquesta revisió. Sense modificar Supabase ni publicar.
- L’auditoria anterior i les seves decisions pendents continuen a [AUDITORIA-DETALL.md](AUDITORIA-DETALL.md); aquesta correcció no modifica el model de dades.

## Configuració: Revisió de dades (canvis locals)

- Consulta reservada al propietari, amb àmbits Joc / Col·lecció / log, camp seleccionable, cerca per títol i filtres de format, retirats o seguiment quan pertoquen. Sense marques Revisat/Sense revisar.
- Camps inclosos: portada, gènere principal, valoració i comentaris compartits confirmats; any/preu de compra per exemplar; completat de log. Text buit o només espais és buit; zero i false no ho són. No tenir valoració no s’etiqueta com a error.
- Lectura paginada específica, llista compacta i detall en consulta amb selecció explícita si hi ha diverses vinculacions. Anterior/Següent conserva l’ordre de revisió; desar actualitza resultats mantenint el registre obert encara que deixi de coincidir. Tanca conserva camp i filtres; es mantenen els permisos i la protecció d’esborranys.
- Exclosos els camps opcionals no carregats, comentaris amb notes antigues i camps amb aplicabilitat pendent. Fitxes sense exemplar/entrada es compten a part i no generen registres ficticis. Vegeu [REVISIO-DADES.md](REVISIO-DADES.md) per als límits i decisions pendents.
- Controls: TypeScript, ESLint, compilació, proves existents i noves proves sintètiques de buits/espais/zero/false/no aplicable, vinculacions i navegació; comprovacions aïllades de permisos, filtres i desament. Proves sense dades reals ni migracions. Sense navegador: pendent de revisar escriptori/mòbil, focus, selecció i interaccions reals del detall. Canvis locals, sense publicar.

## Configuració: ordre i distribució (canvis locals)

- Primera fila: Còpia de seguretat a l’esquerra i Recupera una còpia a la dreta, en dues columnes a partir de 1024 px. Els quadres s’alineen a dalt i mantenen alçades independents segons el contingut. Per sota, una sola columna en aquest mateix ordre.
- Exporta per consultar amb Excel ocupa la fila següent. Revisió de dades queda al final, a tota l’amplada, sense opcions de configuració sota les llistes llargues. Canvia la contrasenya continua abans dels quadres.
- Retirat només el quadre Jocs retirats de Configuració; es conserven els registres, el log i els mecanismes existents de consulta, còpia, restauració i exportació de retirats. Funcions i permisos preservats.
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
- Plataforma actual pertany al joc; Botiga o servei a l’exemplar; log no identifica l’exemplar utilitzat. No es poden propagar botigues a entrades ni unir fitxes pel títol.
- L’abast per fitxa i l’absència de classificació estan resolts en la tanda següent. Continuen pendents les discrepàncies concretes de conversió i la inspecció real, així com les altres discrepàncies de l’auditoria general.
- Aquella tanda només va modificar documentació. Esquema, RPC, importador original i freqüències reals encara no verificats; la preparació de codi posterior es descriu a continuació.

## Plataforma única: implementació preparada, sense migrar

- Substituïda la proposta de classificació i excepcions per registre pels criteris confirmats: una plataforma de text per fitxa, sense tipus ni agrupació de botigues sota PC. Mateix títol en plataformes diferents conserva fitxes independents. Suggeriments i noves opcions lliures.
- Codi compatible amb dades antigues; Botiga es conserva en pendents i desapareix als resolts. Preparats marcador tècnic de transició, RPC i proteccions d’Emulador, plataforma amb vincles i físic/digital; cap conversió aplicada. Entrades antigues no reben botiga deduïda dels exemplars.
- Diagnòstic privat de lectura a Configuració amb grups de plataforma/botiga, log, formats, compres, valoracions, comentaris, Emulador i coincidències. No té acció d’aplicar conversions.
- Preparades lectura v1/v2 de còpies, nova exportació v2 quan el servidor l’admeti, restauració amb bloqueig de sobreescriptures antigues ambigües, CSV i Revisió de dades. Originals, IDs, retirats i compres preservats.
- SQL de lectura d’inspecció, migració i proves SQL amb rollback preparats, no executats. No hi ha connexió d’inspecció ni PostgreSQL local: esquema i combinacions reals no verificats. Abans de migrar cal contrastar RPC/triggers i presentar les discrepàncies reals agrupades.
- Respostes pendents només per als casos concrets: destí d’entrades en separar PC/botigues, repartiment de valoracions/comentaris, exemplar/fitxa que es conserva i compra del digital retirat, i conservació d’exemplars antics d’Emulador. No s’ha programat un executor de conversió massiva.
- Controls TypeScript, ESLint, compilació i proves sintètiques (incloent regressions i còpies v1/v2). SQL i navegador no verificats; revisar amb fixtures locals les altes, errors, plataforma nova, diagnòstic, filtres, estadístiques i restauració. Sense modificar Supabase ni publicar.


## Plataforma: casos resolts i proves locals de conversió

- L’autor resol els tres conflictes Switch que apareixien duplicats als grups Formats/Compres: conservar físics i compres aprovades; retirar només digitals del recompte, mantenint dades i log. No s’incorporen dades personals al repositori. Els altres grups es declaren a zero en el diagnòstic privat; contrast independent encara pendent.
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
- Prova amb timestamps antics: preserva created_at, físics i log; updated_at canvia als registres modificats segons els triggers existents. Evitades actualitzacions redundants del marcador en restaurar i de jocs ja resolts en convertir.
- TypeScript, ESLint, compilació i proves locals superades; avís habitual de mida del bundle. Totals i IDs reals encara pendents de diagnòstic/pla privat; 453 són fitxes pendents, els tres casos estan resolts. Sense conversions reals ni publicació. Detall i reproducció a [VALIDACIO-PLATAFORMA.md](VALIDACIO-PLATAFORMA.md).

## Plataforma: comprovació final de dades preparada

- Plantilla pública de lectura i còpia privada a `/tmp` amb els tres criteris aprovats. Un únic SELECT contrasta propietari/totals, totes les files/IDs, retirats i entrades sense any, un físic i un digital actius per cas, compra física, diagnòstic i empremtes. Encara pendent de rebre l’informe real de dades; el CSV anterior només era d’esquema.
- Preparador de pla privat per IDs fora del repositori, amb bloqueig de canvis i comparació amb una base anterior, sense sobreescriure-la. Recomprovacions per IDs i verificació posterior també només de lectura. No s’han inventat IDs ni recomptes reals; cap conversió aplicada.
- [PLA-FINAL-PLATAFORMA.md](PLA-FINAL-PLATAFORMA.md) detalla execució Windows/SQL Editor, retorn privat, moment del ZIP definitiu, futura transacció única amb assercions/locks, verificació posterior i recuperació sense forçar una v1 sobre fitxes resoltes. Separa BD d’Auth/Storage/navegador.
- Proves sobre l’esquema reconstruït: lectura READ ONLY i cobertura, tres casos, zero/null, digital duplicat, propietari ambigu, empremtes canviades, pla bloquejat i verificació posterior amb detecció de dades no autoritzades. Controls pertinents superats, sense Supabase real ni publicació. Els 453 segueixen sent fitxes pendents; els tres criteris estan resolts.

## Plataforma: comprovació final rebuda i pla privat completat

- Informe real validat independentment: totals globals i per propietari, conjunts complets d’IDs, vincles i empremtes. Inclou exemplars i entrades sense any; cap bloqueig ni altre grup de discrepàncies. Els tres casos aprovats tenen un físic i un digital actius i compres físiques coincidents; els buits digitals es conserven.
- Pla per identificadors i lectures prèvia/posterior generats fora del repositori, sense dades personals als documents públics. Primera base real: no hi havia una empremta antiga amb què acreditar absència de canvis històrics. Cap migració ni publicació.
- Recomptes previstos contrastats: es mantenen fitxes, exemplars totals, físics, log i propòsits; només tres digitals passen a històrics i es resolen les fitxes pendents. Detall privat i procediment a [PLA-FINAL-PLATAFORMA.md](PLA-FINAL-PLATAFORMA.md).
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
- Script complet provat amb esquema públic contrastat i dades sintètiques: només tres digitals deixen el recompte actiu; IDs, compres, comentaris, valoracions, log i propòsits preservats. Rollback de dades i DDL davant dades/IDs/RLS canviats i fallada després de convertir; convidat/anònim rebutjats i reexecució bloquejada.
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

- Analitzat el script exacte: només estructura/RPC/triggers Plataforma, plataforma/updated_at de fitxes i actiu/updated_at dels tres digitals. Sense canviar Auth, assignacions de convidats, log, propòsits o Storage.
- Procediment equivalent de reversió transaccional preparat amb captures de lectura anteriors/posteriors, preservació d’OID/owner/ACL de la RPC original, dades/metadata exactes i protecció contra edicions noves. Materials/eines privats persistents, permisos 0700/0600.
- Prova aïllada sobre esquema contrastat i dades sintètiques superada: aplicar/revertir recupera hashes de dades i esquema/RLS/ACL, timestamps i vincles; reversió incorrecta avorta sense canvis parcials i edició posterior no es sobreescriu. Regressions de la transacció i ESLint superats.
- Pendent SELECT privat de captura dels valors originals reals: sense retornar i verificar aquest resultat no es dona per custodiada la recuperació real. Després cal ZIP definitiu addicional i recomprovació immediata; captura posterior obligatòria després d’una futura aplicació, abans de generar/autoritzar la reversió. No cal recuperar Auth/convidats/Storage per aquesta inversa en la mateixa base; pèrdua externa del projecte continua fora d’abast. Cap execució remota ni publicació.

## Plataforma: originals reals per a reversió verificats i custodiats

- Captura anterior rebuda, CSV/JSON privat persistent 0600; 453 fitxes i tres digitals exactes, dades/esquema coincidents amb el pla i timestamps/camps dels tres casos contrastats. Bundle de reversió completat amb valors originals reals i esquema, manifest de hashes i eines provades.
- Ja no falta l’exportació dels originals. Següent: pausar escriptures, descarregar/verificar ZIP definitiu i recomprovar immediatament per IDs; qualsevol canvi obliga a revisar/renovar pla/captura/material. Autorització d’aplicació pendent.
- Després d’una futura aplicació cal capturar l’estat posterior per generar i autoritzar la reversió executable; cap empremta posterior inventada. No s’ha aplicat ni publicat.

## Nomenclatura log i proposta d’altes (canvis locals)

- Aplicat «log», en minúscules, i «entrada de log» als textos de menú, títols, botons, alta actual, detall, seguiment, estadístiques, Configuració, restauració, missatges i documentació. Cap canvi de rutes, taules, camps, identificadors tècnics o relacions.
- [PROPOSTA-ALTES.md](PROPOSTA-ALTES.md) descriu els recorreguts separats de Col·lecció i log, dades del joc/exemplar/entrada, exemples i decisions obertes. Criteris confirmats: no crear entrades des de l’alta de Col·lecció, no crear exemplars des del log, distingir joc/plataforma per ID, Emulador només al log i valoració/comentaris compartits per fitxa.
- Nous formularis no implementats. L’alta actual manté la selecció prèvia existent/nou i el control compartit Jugant; la separació d’aquest comportament correspon a la proposta següent.
- Verificació: cerca de variants antigues als textos del client i documentació, comparació dels identificadors tècnics, TypeScript, ESLint, compilació i suites existents. Sense proves que modifiquin Supabase.
- Sense navegador disponible: pendent de revisió visual dels textos, dels salts de línia en mòbil i del menú. Canvis locals, sense publicació.


## 2026-10-11 — Formularis d’alta aprovats, preparats localment

- Col·lecció: alta directa joc/exemplar, sense crear entrades; log: títol amb suggeriments per plataforma/ID, any obligatori actual, sense exemplar. Duplicats ofereixen obrir el registre; no es fusionen fitxes ni entrades antigues sense any.
- Dades compartides en consulta amb edició explícita; Jugant global només al log. Plataformes noves, 0 € i Emulador només al log. Físic sobre digital requereix confirmació i conserva l’històric.
- Desament atòmic, reintents idempotents, protecció de canvis i detall posterior en consulta. RPC preparada en `202610110001_altes_atomiques.sql`, **no aplicada**: formularis no operatius al servidor fins a aplicar-la amb autorització. Diagnòstic només de lectura preparat; cap restricció global sobre registres antics.
- Proves sintètiques locals amb esquema contrastat: altes, duplicats, anys antics, dades compartides, rollback, reintents i permisos. Revisió visual/interaccions al navegador i comprovació de la RPC en servidor pendents. No s’han escrit dades reals ni publicat.
- [PROPOSTA-ALTES.md](PROPOSTA-ALTES.md) substitueix les decisions obertes anteriors pels criteris aprovats i documenta la dependència, el recorregut i les limitacions.

- Controls finals d’aquesta tanda: TypeScript, ESLint, compilació, cinc suites de regressió/helpers, consulta inicial HTML sintètica i RPC PostgreSQL local superats. Avís existent de paquet >500 kB. Sense navegador: pendents interaccions, escriptori/mòbil i desament amb RPC aplicada; diagnòstic real no executat.

## 2026-10-13 — Continuació local: Inici, Galeria, plataformes i neteja

### Canvis preparats i operatius al client local

- Jocs a l’atzar: selecció per sessió/usuari en memòria fora del component; es conserva en obrir/tancar detalls, navegar i refrescar dades. Només es renova amb el botó circular de dues fletxes verdes (nom accessible «Renova els jocs a l’atzar», focus visible, 44 × 44 px) o amb una recàrrega completa. Fins a tres actius amb portada, sense duplicats; renovació amb un conjunt diferent si hi ha alternatives. Si un joc deixa de ser elegible, només se substitueix aquell. Amb menys de tres elegibles se’n mostren els disponibles. No s’implementen Tots / Els millors / Favorits.
- Col·lecció inicia en Galeria si no hi ha preferència explícita. Llista/Galeria es recorden durant la navegació amb URL i preferència de sessió; si Storage no està disponible, la preferència dura la visita en memòria. Els enllaços d’Inici a físics/digitals creen una consulta nova amb el filtre `format` real i sense plataformes, gèneres o joc residuals. Es mantenen recomptes i consulta dels convidats.
- GB es mostra com a Game Boy en opcions, registres relacionats, filtres, estadístiques i CSV. Es dedupliquen els àlies al selector. Les còpies v1/v2 amb GB es poden llegir sense canviar IDs ni vincles; els ZIP preserven el valor real original mentre no s’apliqui la conversió.
- Retirada la interfície «Conversió de Plataforma: discrepàncies» de Configuració perquè el pla 002 ja està aplicat i verificat. Codi històric, RPC/migracions, proves i recuperació es conserven; còpies, recuperació, Excel i Revisió de dades es mantenen. No hi ha cap altra ruta d’importació/migració activa a l’aplicació. El visor de lectura «Dades originals de l’Excel» al detall és dubtós: conserva un ús de procedència documentat i no es retira sense resposta.

### Dependències i decisions pendents

- Formularis d’alta aprovats revisats i provats novament: Col·lecció sense log; log sense exemplar; any actual obligatori, una entrada per joc/any sense consolidar antics; camps compartits amb edició explícita, Jugant global, consulta després de desar, permisos i atomicitat. **Segueixen depenent de la RPC `202610110001_altes_atomiques.sql`, preparada i no aplicada**. Diagnòstic real d’altes pendent. Vegeu [PROPOSTA-ALTES.md](PROPOSTA-ALTES.md).
- Game Boy: migració `202610120001_game_boy.sql` i lectura `GAME-BOY-LECTURA.sql` preparades; no aplicades. Abans cal diagnòstic actual de coincidències, còpia/verificació i reversió específica. No reutilitzar el bundle del pla 002 com a cobertura d’aquest nou canvi. Dependència del servidor per al desament/restauració canònics.
- [NOMS-PLATAFORMES.md](NOMS-PLATAFORMES.md) agrupa les propostes GBA/N64/NDS/NES/SNES/Famicom, MD/XBOX/XBOX360 i PS4/MSX. Inventari històric, no lectura actual; totes excepte GB requereixen resposta abans de convertir. No es dedueix cap plataforma pel títol.

### Idees futures: només documentades

- Tràiler de YouTube al detall, com a enllaç o vídeo incrustat. Estudiar cerca assistida/automàtica amb títol, plataforma/edició i altres metadades, mostrant candidats per confirmar el vídeo correcte; evitar una càrrega manual massiva. No s’afegeixen camps ni integracions encara.
- Enllaços a fitxes externes, amb MobyGames com a font preferida. Concretar identificadors, atribucions i confirmació abans d’implementar-los.
- Eina de revisió d’enllaços quan aquests existeixin: separar 404/410 confirmat de bloqueig/CORS, autenticació, límit de peticions o error temporal; estats «correcte», «trencat», «no comprovable» i «pendent de reintent», amb data i revisió manual. No declarar trencat un enllaç només perquè el navegador no el pot comprovar. Proposar el servei de comprovació i la política de reintents en aquella tanda.

### Verificació d’aquesta tanda

- Proves sintètiques de selecció persistent, canvis d’elegibilitat, renovació alternativa, zero/menys de tres candidats, Game Boy/opcions/CSV/estadístiques/còpies i renderitzat HTML de Galeria, Llista explícita, filtres reals, enllaços nets d’Inici i convidats.
- Proves PostgreSQL locals d’altes atòmiques i Game Boy sobre esquema reconstruït: preservació de dades, errors/rollback, duplicats i permisos. Sense dades reals ni connexió a Supabase.
- Navegador no disponible: pendents clics reals, navegació/remuntatge, focus, presentació escriptori/mòbil, recàrrega i desament després d’aplicar les RPC autoritzades. Auth/Storage/PostgREST reals i diagnòstics actuals no verificats. No s’ha publicat ni executat cap migració remota.

- Controls finals superats: TypeScript, ESLint, compilació, sis suites de regressió/helpers, cinc casos de renderitzat HTML i les dues proves PostgreSQL locals (altes/Game Boy amb restauració v1/v2 i ACL). Avís existent de paquet >500 kB; cap verificació visual DOM real.


## 2026-10-13 — Noms aprovats i dependències en una única tanda

- Noms exactes confirmats i aplicats al client: Game Boy, Game Boy Advance, Nintendo 64, Nintendo DS, NES, Super Nintendo, Mega Drive, Xbox 360, PlayStation 4, Famicom, MSX i XBOX. XBOX és la primera Xbox; no es fusiona amb altres consoles. Mapa únic client/SQL, opcions sense duplicats, filtres/estadístiques/CSV i compatibilitat v1/v2.
- Retirat només el visor Dades originals de l’Excel. `origen`, notes, dades originals i còpies/restauració es conserven; no es modifica cap fila real.
- L’usuari confirma satisfactòriament els canvis visuals anteriors. Pendent comprovar els ajustos nous i el desament remot després d’aplicar les RPC amb autorització.
- [NOMS-PLATAFORMES.md](NOMS-PLATAFORMES.md) substitueix les propostes de noms i agrupa RPC d’altes + normalització. Una sola captura privada només de lectura inclou metadades, dades, col·lisions i diagnòstic; es reutilitza també per a la captura posterior/recuperació. No cal exportar successivament informes separats.
- Generadors conjunts de pla/aplicació/reversió privats preparats, amb guardes d’esquema/RLS/ACL/files i postvalidació. Plantilla pública explícitament no executable. Es preserven migracions històriques, proves i recuperació del pla 002. No s’han generat plans reals nous amb captures antigues.
- Proves sintètiques: permisos, altes atòmiques, duplicats, noms exactes, còpies, preservació, captura READ ONLY, rollback de DDL/dades i recuperació exacta; modificacions posteriors d’ACL bloquegen la reversió. Pendents captura real, contrast, conflictes/totals, ZIP, bundle vigent i autorització. Cap migració aplicada, dades reals modificades o publicació.
- Galeria de tres columnes: proposta pendent, no implementada. Es mantenen les columnes actuals i les idees futures de tràilers/enllaços/revisió d’enllaços.

- Controls finals d’aquesta tanda superats: TypeScript, ESLint, compilació, sis suites de regressió/helpers i sis casos HTML, més altes/permisos i tanda conjunta/reversió en PostgreSQL local. Es manté l’avís de paquet >500 kB. Confirmació visual anterior de l’usuari registrada; no es dona per comprovat el servei remot ni la concurrència amb clients antics.

## Procediment agrupat d’altes i noms (2026-10-13)

- Substituït el circuit de captures successives pel procediment de `docs/NOMS-PLATAFORMES.md`: tres intervencions manuals en cas d’èxit —una captura inicial conjunta, ZIP definitiu i execució única amb desament del mateix resultat—. La recomprovació immediata i la verificació de dades/permisos van dins del script; no es demanen exportacions separades d’informació ja coberta.
- Preparació local del batch que retorna després del COMMIT la captura posterior i la reversió exacta, sense objectes persistents nous. Provats aplicar/recuperar, fallada després del DDL, dades desactualitzades i col·lisions, amb esquema contrastat i registres sintètics. Falta contrastar una captura actual única: noms/IDs/col·lisions, definicions i permisos vigents, valors originals de recuperació. No es donen aquests punts reals per comprovats.
- Accés des d’Ubuntu proposat amb psql i configuració privada guiada; no instal·lat ni configurat. No s’han aplicat canvis a Supabase ni publicat. Auth/Storage API, navegador i presentació del resultat final al SQL Editor real continuen sense comprovació independent.
- Les tres columnes de la Galeria continuen pendents; aquesta tanda no les implementa.

## Altes i noms: captura conjunta validada i pla privat preparat (2026-10-13)

- Captura actual contrastada independentment: cobertura de les cinc taules, IDs únics, vincles i propietaris consistents, cap col·lisió entre noms aprovats ni grup joc/any repetit; definicions i metadades necessàries sense omissions. Les dues RPC d’alta encara no existeixen. No s’ha executat cap canvi remot.
- 123 fitxes es normalitzaran sense fusionar-les ni canviar-ne vincles. Totals abans/després: 453 fitxes, 440 exemplars, 437 actius (218 físics i 219 digitals), 3 històrics, **202** entrades de log i 4 propòsits. El recompte anterior de 201 entrades no és la base d’aquesta tanda. Els tres casos aprovats del pla 002 contrastats per IDs continuen resolts.
- Es conserven 122 entrades sense any i un joc amb dos exemplars físics actius; aquesta tanda no consolida registres antics ni imposa restriccions globals. Qualsevol futura consolidació dels exemplars necessita una decisió separada.
- Pla, captura, metadades, validació, procediment i script únic desats fora del repositori a la carpeta privada persistent, amb permisos restringits i manifest d’empremtes. El script integra recomprovació exacta, aplicació, verificació i resultat post-COMMIT amb reversió; no cal cap altra exportació SQL rutinària.
- Proves locals amb l’esquema de la captura actual i dades sintètiques: altes atòmiques/permisos, aplicar/verificar/recuperar, rollback davant canvis o col·lisions i restauració v1/v2 dels àlies aprovats. Reconstrucció local ajustada per resoldre les dependències entre wrappers SQL i auxiliars durant la creació, reactivant-ne la validació abans de les proves i sense reexecutar la migració Plataforma quan ja hi és.
- Següent pas: pausar edicions i retornar la ruta del ZIP definitiu per validar-lo. Després, només amb autorització, una execució sencera i desament del seu resultat complet. No s’ha aplicat ni publicat. SQL Editor real, navegador i serveis Auth/Storage/PostgREST continuen sense verificació independent en aquesta tanda. Revisió de l’aparença del log i tres columnes de Galeria continuen pendents.

## Rebut d’aplicació: revisió de seguretat abans d’executar

- L’usuari ha cancel·lat la confirmació del SQL Editor. Revisat el rebut: taula temporal de sessió `pg_temp_N`, una columna JSONB amb dades/inversa, sense taula permanent exposada. Nova versió privada revoca PUBLIC/anon/authenticated/service_role i verifica ACL de taula/columnes, herència efectiva, propietari i temporalitat abans del COMMIT. No es modifica RLS de cap taula d’aplicació.
- Provat localment amb esquema contrastat i dades sintètiques: lectura denegada als rols API i PUBLIC, defaults globals permissius neutralitzats, concessions inesperades de taula/columna avorten tota la tanda; verificació, v1/v2 i recuperació exacta superades. Avís de destrucció revisat: DROP de la inversa només dins de text; cap DROP/DELETE/TRUNCATE executat en aplicar.
- Utilitzar únicament el nou script privat revisat. Al diàleg RLS, Run without RLS conserva el batch provat; no afegir ALTER TABLE automàtics després del resultat. Documentació completa a NOMS-PLATAFORMES.md. Pla, captura i ZIP continuen custodiats i no es regeneren amb dades diferents. No s’ha executat res a Supabase ni publicat. API remota i diàleg real encara no provats independentment.
