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
