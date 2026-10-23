# Edició i resum d’Inici — entrega del 23 d’octubre de 2026

## Edició

Nom, plataforma i valoració comparteixen fila en escriptori. En mòbil, nom
ocupa una fila i plataforma/valoració la següent. La valoració continua sent
estreta; preu independent, amb espai per a 999,99 i decimals sense conversió
nova de dades. Comentaris i Configuració continuen amples, abans dels botons
inferiors. El controlador únic d’eliminació, les confirmacions i els avisos
de canvis sense desar de la tanda anterior es conserven.

Dues capses amb llegendes accessibles, color subtil i vores: seguiment i
preferències (No jugat, Hi estic jugant, Per jugar aviat, Vull jugar-hi,
No vull jugar-hi, Per jugar amb infants), i marques d’exemplar (Favorit,
Possible venda o intercanvi, Reproducció, No localitzat). En el log només
apareix la primera: les marques d’exemplar no s’inventen ni s’assignen al joc.
No jugat és independent; les dues intencions es mantenen excloents.

### Per què la plataforma està protegida

La plataforma es desa a `fitxes_joc.plataforma`. `exemplars.joc_id` i
`experiencies.joc_id` apunten a aquesta mateixa fitxa. Canviar la plataforma
no editaria altres fitxes independents, però tots els exemplars i totes les
entrades de log vinculades mostrarien la nova plataforma, inclosos els
històrics. No és una propietat independent de l’exemplar o de l’entrada.

Les definicions locals contrastades del model Plataforma 2 ho protegeixen:
`desar_registre_plataforma` rebutja una plataforma diferent de la desada;
`comprova_fitxa_plataforma` també la rebutja si hi ha exemplars o entrades.
Vegeu `supabase/migrations/202610090001_plataforma.sql`. L’edició vigent passa
per aquesta RPC; no s’ha substituït per una escriptura directa per esquivar-la.
No s’ha consultat ni modificat l’esquema remot en aquesta tanda.

Per permetre una correcció real caldria acordar si és una correcció de la
fitxa i de tots els seus vincles o si es tracta d’un altre joc/plataforma.
Una operació de servidor específica hauria de validar permisos, concurrència,
col·lisions de nom/plataforma, formats i la prohibició d’exemplars d’Emulador;
mostrar l’impacte i conservar IDs, valoracions, comentaris i log. Després,
adaptar explícitament les guardes de RPC/trigger i provar-ho abans d’aplicar
SQL autoritzat. No s’ha preparat cap migració ni s’han mogut vincles.

## Cinc targetes d’Inici

1. Jocs físics: `format=fisic`.
2. Jocs digitals: `format=digital`.
3. Vull jugar: `fitxes_joc.intencio_joc=vull` dins de la col·lecció activa.
4. Jocs top: valoració A+ o A++.
5. Jocs MEH: valoració D.

La unitat és **l’exemplar actiu**, igual que la Col·lecció i el seu recompte
de resultats. No es deduplica per nom, ni es multiplica per entrades de log.
Dos exemplars actius d’una mateixa fitxa continuen comptant com dues files.
Els jocs presents només al log no es compten a Vull jugar: l’accés anunciat
obre Col·lecció i ha de retornar exactament el recompte anunciat.

Numerador i denominador Top/MEH fan servir la mateixa base completa, inclosos
els exemplars de fitxes sense valoració. Format català amb un decimal; zero
quan no hi ha col·lecció. No s’utilitza una pàgina parcial: `getCatalog` ja
recorre tots els lots, i la consulta de TanStack Query es comparteix amb el
cercador i la resta d’Inici.

`collectionRecords` aplica els mateixos filtres a les targetes i al catàleg.
El filtre repetit `valoracio=A%2B&valoracio=A%2B%2B` significa OR; es combina
amb cerca, plataforma, format i marques existents. El selector del catàleg
reflecteix Top i permet canviar la valoració. Els enllaços de les targetes
es creen des de zero: no hereten cerca, filtres residuals ni paginació.
No hi ha paginació local del catàleg per reiniciar. Es conserva la preferència
Llista/Galeria existent, sense forçar-la des de les targetes.

Cercador en una fila pròpia sota les targetes, amb capçal i lupa. Conserva la
cerca global per ID i plataforma, els suggeriments i la protecció de focus
abans del click. La prova interactiva de clic/toc/Retorn no ha reproduït el
bug antic de selecció; no s’ha canviat la lògica del cercador sense evidència.

## Revisió

Proves amb catàleg sintètic, dos exemplars de la mateixa fitxa, títols iguals
en plataformes diferents, joc només al log, exemplars històrics, absència de
valoració, col·lecció buida i més de 500 exemplars. Navegació de targetes i
cercador amb Chromium; edició/desar/desfer/errors/eliminació cancel·lada amb
peticions interceptades. No s’han modificat registres reals.

Resultat local: TypeScript, ESLint i compilació superats; 71 proves lògiques
i 36 de renderitzat sense errors. Chromium: 12 combinacions d’edició i 8
d’Inici, en Clar/Fosc; 1024 px inclòs per comprovar la fila de cinc targetes
amb menú lateral. Els desaments de 0 i 999,99 es comproven amb peticions
interceptades. Vite manté l’avís de bundle superior a 500 kB, sense error.

Pendents: revisió visual i funcional personal amb la sessió habitual, permisos
reals i comprovacions manuals ajornades. Aquestes proves no les substitueixen.
L’usuari ha autoritzat publicar aquesta tanda amb el flux existent de Pages.
La publicació del client no executa SQL ni modifica RPC, model o dades.
L’estat efectiu del desplegament es comprova després del push. Les captures
públiques existents es conserven i es renovaran més endavant.


## Refinament exclusiu de les targetes

Conjunt centrat amb màxim 56 rem (896 px), cinc columnes en escriptori i
adaptació a tres/dos en amplades inferiors. En monitors amplis cada targeta
fa uns 168 px, amb 14 px de separació; el cercador conserva tota l’amplada.
Icones de 26 px dins un fons de 40 px, xifres de 28/32 px i percentatge de
16 px sota la xifra. Els espais buits dels altres percentatges són purament
visuals i ocults a tecnologies assistives: no s’hi inventen dades.

Accents diferenciats amb colors propis per a Clar/Fosc. Contrast comprovat
sobre els colors compostos reals: almenys 4,5:1 per a textos i 3:1 per a
icones. El hover puja 1 px només amb moviment permès; focus de teclat visible.
Prova de 24 combinacions d’amplada/tema/moviment, valors 1234 i 100,0 %,
alineació d’altures/etiquetes i percentatges, sense desbordament. Lògica de
recomptes, filtres i navegació intacta. Revisió visual personal encara pendent.
