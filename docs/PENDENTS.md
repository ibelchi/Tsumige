# Treball pendent

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

## Pendents de revisió o decisió

Les propostes següents no estan aprovades per implementar-les.

- Revisar la distribució del detall i reduir el control de valoració, amb una ubicació adequada.
- Auditar els camps del detall respecte de l’esquema vigent: omissions, camps condicionals i camps tècnics. No assumir que tots s’han de mostrar.
- Revisió de dades a Configuració: escollir un camp i consultar registres on sigui buit, amb navegació entre detalls. Zero euros no és buit; un camp buit no sempre és un error.
- Col·lecció ha de donar d’alta jocs; Bitàcora, entrades de joc. Es planteja cercar un joc existent o escriure un títol nou fora de la col·lecció a Bitàcora; el funcionament concret queda per decidir.
- Substituir el terme experiència; proposta: entrada de Bitàcora.
- Unificar Plataforma i Botiga o servei en un únic camp visible Plataforma, amb classificació interna de maquinari, botiga o altra via d’accés. Revisar dades i conseqüències abans de migrar. Físic/digital continua independent.
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
- Consulta adaptable: portada damunt de la informació al mòbil i al costat en escriptori; indicadors i accions poden ocupar diverses línies. No s’ha fet l’auditoria pendent de l’esquema ni la retirada dels camps Revisat del formulari existent.
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
- La revisió general del disseny i l’auditoria dels camps respecte de l’esquema continuen pendents; aquests ajustos no les donen per completades.

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
