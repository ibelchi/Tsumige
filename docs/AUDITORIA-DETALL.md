# Auditoria dels camps del detall

Actualització posterior: l’esquema públic/RPC/RLS s’ha contrastat amb informes reals exportats i s’ha reconstruït per a proves locals amb dades sintètiques. Plataforma única ja està aplicada i verificada; consulteu l’estat vigent de [PROPOSTA-PLATAFORMA.md](PROPOSTA-PLATAFORMA.md). L’inventari següent conserva la situació auditada original i les discrepàncies alienes a Plataforma continuen pendents; no s’han migrat automàticament Favorit ni altres camps.

Auditoria local del 9 d’octubre de 2026. Sense registres personals, consultes a les dades reals ni canvis de model. Les correccions de model d’aquest document continuen sent propostes. La primera versió autoritzada de Revisió de dades s’ha implementat posteriorment: vegeu [REVISIO-DADES.md](REVISIO-DADES.md) per als camps inclosos, les exclusions i el comportament vigent.

L’inventari descriu el detall de la tanda anterior. Per a la preparació posterior de Plataforma única, sense tipus interns, vegeu [PROPOSTA-PLATAFORMA.md](PROPOSTA-PLATAFORMA.md); Botiga només desapareix quan la conversió estigui resolta.

## Abast i fonts

S’han comparat [els tipus](../src/lib/database.types.ts), [el formulari](../src/components/record-editor.tsx), [la consulta](../src/components/record-details.tsx), [l’alta](../src/components/record-creator.tsx), [les operacions de desament](../src/lib/catalog.ts), els auxiliars de [valoració](../src/lib/game-rating.ts) i [comentaris](../src/lib/game-comments.ts), [les còpies](../src/lib/backup.ts), [els CSV](../src/lib/csv.ts), [la validació de restauració](../src/lib/restore-archive.ts) i [la migració de restauració](../supabase/migrations/202610070006_restauracio.sql).

**No s’ha consultat l’esquema real de Supabase.** Aquest entorn no ofereix una connexió d’inspecció de l’esquema del projecte. Els tipus TypeScript són una declaració del client, no una introspecció de PostgreSQL. El repositori només conté la migració de restauració: no inclou la creació completa de les taules, `desar_registre`, `crear_registre`, ni les migracions originals de valoració, comentaris i infants. Per tant, no es poden confirmar aquí totes les columnes, defaults, restriccions, polítiques o triggers vigents. Les afirmacions sobre sincronització al servidor que consten al codi i a Arquitectura queden pendents de contrastar amb el SQL real.

La migració local confirma que la restauració utilitza els camps del model relacionat, conserva `revisat`, `origen`, `notes` i les valoracions de compatibilitat, i afegeix `portada_fitxer`. No s’ha executat cap migració ni cap prova SQL.

## Separació actual de dades

| Àmbit | Taula usada pel detall | Unitat |
| --- | --- | --- |
| Joc | `fitxes_joc` | Identitat, plataforma, metadades, portada, valoració i comentaris compartits. |
| Col·lecció | `exemplars` | Un exemplar físic o digital, amb compra, regió, favorit i situació de propietat. Un joc pot tenir diversos exemplars. |
| Bitàcora | `experiencies` | Un registre relacionat amb un joc, amb any i resultat. Pot existir sense exemplar. També hi ha registres de seguiment amb any nul. |

El tipus antic `Joc` i la taula declarada `jocs` barregen propietat i joc. Inclouen `mes_compra`, `mes_jugat`, `estat_joc`, format `rom`, etc. El detall actual llegeix `fitxes_joc`, `exemplars` i `experiencies`; aquells camps antics **no són omissions demostrades de les taules actuals**. No s’han de reincorporar sense verificar-ne l’ús i l’esquema. Els Propòsits tenen taula i interfície pròpies i queden fora del detall del joc.

## Inventari: camps del joc

«Editable» sempre pressuposa propietari, mode edició i exemplar no retirat. Els convidats només consulten. A l’alta s’utilitzen els mateixos controls, amb un joc existent o nou.

| Camp | Consulta | Edició / desament | Condició o observació |
| --- | --- | --- | --- |
| `nom` | Títol complet. | Editable, obligatori. | Identitat compartida; no és un nom independent per exemplar o entrada. |
| `plataforma` | Visible. | Editable, obligatori. | Etiqueta del formulari: Plataforma o lloc d’accés. Encara separat de botiga/servei. |
| `desenvolupadora` | Visible, buit amb guió. | Editable. | Admet nul segons els tipus. |
| `genere_principal` | Visible. | Editable. | No és una llista de gèneres. |
| `generos_secundaris` | Absent del detall. | Sense control; no s’inclou al payload d’edició. | Tipus, restauració i CSV de col·lecció el conserven. |
| `any_llancament` | Visible. | Editable, 1–9999 o buit. | No confondre amb any de compra o joc. |
| `sinopsi` | Absent del detall. | Sense control; no s’inclou al payload d’edició. | Tipus, restauració i CSV de col·lecció el conserven. RAWG/IGDB mostren descripció a la cerca però només s’aplica la imatge. |
| `portada_url` | Imatge, no el URL com a camp. | Editable a Configuració; selecció manual de proveïdor. | Pot ser nul. No és l’única forma de tenir portada. |
| `portada_font_url` | Enllaç IGDB/RAWG si es reconeix el domini. | Assignat en seleccionar la imatge; editar manualment el URL de portada el deixa nul. | Sense control directe de font. El formulari antic etiqueta qualsevol font no IGDB com RAWG; la consulta ja distingeix dominis. Proposta: unificar la detecció. |
| `portada_fitxer` | Indirecte: permet mostrar la imatge restaurada. | No editable; restauració/Storage. | Tècnic. La migració elimina la referència quan es canvia explícitament el URL. |
| `portada_visual_url` | URL temporal utilitzat per mostrar la imatge. | No editable ni columna demostrada. | Derivat al client per `withStoredCovers`; la validació de restauració l’elimina. No revisar-lo com a dada permanent. |
| `valoracio` | Una valoració sota la portada; no apareix si és nul·la. | Un control únic A++/A+/A/B/C/D/en blanc. | Camp opcional als tipus per compatibilitat. A+ i A++ són vermells. Disponible tant des d’exemplars com des de Bitàcora, inclosos jocs no posseïts. |
| `comentaris` | Text compartit; buit amb guió. | Editable si no hi ha conflicte de notes antigues. | Camp opcional. Si la columna no és reconeguda pel client, canviar el comentari mostra un error i demana la migració existent; no l’executa. |
| `per_jugar_aviat` | Etiqueta només quan és true. | Tic en exemplars i Bitàcora. | Camp del joc, no de cada entrada. |
| `per_infants` | Etiqueta només quan és true. | Tic en exemplars i Bitàcora. | Disponible també fora de la col·lecció. Opcional als tipus: si falta i es marca, es bloqueja el desament; si està disponible s’envia true/false. |
| `id`, `user_id` | No visibles. | No editables. | Identificador i propietari; relacions/permisos. |
| `created_at`, `updated_at` | No visibles. | No editables. | Marques de temps tècniques. |

## Inventari: camps de col·lecció

| Camp | Consulta | Edició / desament | Condició o observació |
| --- | --- | --- | --- |
| `format` | Físic/Digital. | Selector editable. | Pertany a l’exemplar. |
| `regio` | Visible. | Editable. | Opcional també en digital; no hi ha condició de format al formulari. |
| `estat_conservacio` | Conservació. | Editable. | No queda restringit als exemplars físics. |
| `any_compra` | Visible. | Editable, 1–9999 o buit. | Un any per exemplar. |
| `preu` | Moneda; 0 es mostra com a zero euros. | Editable, mínim 0, pas 0,01 o buit. | `null` i 0 són diferents. |
| `botiga_servei` | Visible i normalitzat amb `storeName`. | Selector i alta de nova opció només en format digital. | En físic, el control es desactiva però el valor existent es conserva i es continua enviant. |
| `favorit` | Estrella al títol només quan és true. | Tic editable. | Pertany a l’exemplar, no a la fitxa de joc. No hi ha control ni estrella quan el detall és una experiència, encara que aquell joc tingui un exemplar favorit. |
| `canvi` | Etiqueta Possiblement d’intercanvi quan és true. | Tic Possible venda o intercanvi. | Etiquetes diferents per al mateix camp; cal decidir si es vol unificar el terme. |
| `reproduccio` | Etiqueta només quan és true. | Tic editable. | Sense interpretar false com a buit. |
| `no_localitzat` | Etiqueta només quan és true. | Tic editable. | Nul es presenta com a desmarcat. Si el valor inicial és nul i es desa desmarcat es manté nul; un true inicial desmarcat es desa false. El tic no permet triar explícitament l’estat desconegut. |
| `a_la_colleccio` | Estat retirat i situació de propietat. | Accions Retira / Torna a la col·lecció, sense tic. | Un exemplar retirat es consulta però cal recuperar-lo abans d’editar. |
| `notes` | Només com a compatibilitat de comentaris o conflictes antics. | Sense control independent; s’envia el valor existent. | No són un comentari editable específic d’aquest exemplar. |
| `revisat` | Retirat de la interfície en aquesta tanda. | Sense tic; s’envia el valor existent. | Dada històrica de la importació; es manté a tipus, còpies ZIP, CSV i restauració. |
| `origen` | Absent de consulta. | JSON de lectura a Dades originals de l’Excel, només si existeix; no editable. | Procedència tècnica; no s’ha retirat aquest visor en eliminar les marques de revisió. No s’hi inclouen dades personals en aquesta auditoria. |
| `id`, `user_id`, `joc_id`, `created_at`, `updated_at` | No visibles. | No editables. | Identificadors, vinculació, propietari i marques de temps. |

## Inventari: camps de Bitàcora

| Camp | Consulta | Edició / desament | Condició o observació |
| --- | --- | --- | --- |
| `any_jugat` | Any de joc. | Editable, 1–9999 o buit. | La llista de Bitàcora exclou registres amb any nul; no són necessàriament errors, poden ser seguiment. |
| `completat` | Sí / No / No aplicable / guió. | Selector editable amb opció En blanc. | Nul i No són diferents. |
| `jugant` | Etiqueta agregada: true si qualsevol experiència del joc està marcada. | Tic amb funcionament sobre el conjunt del joc. | Desmarcar des del detall desactiva totes les experiències jugant; marcar pot crear un registre amb any nul si no n’hi ha cap de marcat. No representa només la fila oberta. |
| `valoracio` | No es mostra com a valoració independent de l’entrada. | El selector visible és la valoració del joc. | El payload de l’experiència també inclou valoració; després es fa una escriptura explícita a `fitxes_joc.valoracio`. Compatibilitat/sincronització pendent de verificar al servidor. |
| `notes` | Compatibilitat amb comentaris compartits. | Sense control independent; s’envia el valor existent. | Es conserven les notes antigues. |
| `revisat` | Retirat de la interfície. | Sense tic; s’envia el valor existent. | Conservat en còpies i restauració. |
| `origen` | Absent de consulta. | JSON de lectura condicional a l’editor. | Exclusivament procedència tècnica, no un camp de joc. |
| `id`, `user_id`, `joc_id`, `created_at`, `updated_at` | No visibles. | No editables. | Identificadors, relació, propietari i temps. |

Els enllaços A la col·lecció són derivats dels exemplars actius, no un camp de l’experiència. Favorit no existeix al tipus `Experiencia` ni a `FitxaJoc`; no hi ha manera de marcar un joc sense exemplar com a favorit amb el model actual. En canvi, Per jugar amb infants, comentaris i valoració sí que són accessibles des d’una experiència d’un joc no posseït.

## Discrepàncies i correccions proposades

1. **Favorit de joc o d’exemplar.** La decisió funcional diu que és independent de la valoració i cal tenir-lo disponible fora de la col·lecció. La implementació actual només el desa a `exemplars`. Cal decidir-ne l’abast abans d’afegir un camp o migrar. Proposta si ha de ser del joc: estudiar traslladar-lo a `fitxes_joc` i una conciliació dels exemplars; no està aprovat ni implementat. Si continua sent d’exemplar, es podria mostrar a Bitàcora l’estat derivat dels exemplars, però això no resol els jocs sense exemplar ni permet editar un favorit global.
2. **Valoració única i compatibilitat.** `gameRating` prioritza `fitxes_joc.valoracio`, fins i tot si és nul·la; només si és undefined recorre a les experiències i només retorna un valor si no hi ha contradiccions. El blanc pot ser expressament escollit. Les escriptures de registre, valoració i seguiment no formen una sola transacció al client: poden quedar dades parcialment desades si una etapa falla. Proposta: inspeccionar les funcions/triggers reals, documentar la font canònica i, si s’aprova, estudiar un desament atòmic. No s’ha canviat aquest circuit. A més, el CSV de col·lecció escriu `fitxes_joc.valoracio` directament, mentre que el d’historial té fallback a la valoració de l’experiència: si el camp del joc falta, la consulta pot mostrar una valoració antiga que el CSV de col·lecció exporta en blanc. Proposta: acordar i unificar la regla d’exportació sense perdre els valors originals.
3. **Comentaris compartits.** `gameComments` prioritza el camp del joc, inclòs un nul explícit; si falta, recupera una nota antiga única. Si hi ha diverses notes diferents, la consulta les mostra i l’editor bloqueja la unificació. Proposta: eina de conciliació específica, sense descartar ni fusionar automàticament notes. La manca de comentari compartit no és necessàriament manca de notes.
4. **Infants i camps opcionals.** El tic és disponible en col·lecció i Bitàcora, però l’absència d’una propietat opcional pot indicar esquema antic o dades no carregades, no simplement false. Cal verificar columnes i versions reals abans de convertir aquests casos en resultats de Revisió de dades.
5. **Sinopsi i gèneres secundaris.** Existeixen al model local i a còpies/restauració, però no al detall. Proposta: decidir primer si s’han de consultar, editar o mantenir només com a metadades. La cerca de portades no els aplica. No s’han afegit controls.
6. **Camps condicionals.** Decidir si regió/conservació han de continuar disponibles en digital, si botiga/servei ha de ser editable en físic i com mostrar un `no_localitzat` desconegut. La plataforma única té criteris confirmats i codi/SQL preparats, sense migració aplicada; el document vigent és [PROPOSTA-PLATAFORMA.md](PROPOSTA-PLATAFORMA.md). Les conversions ambigües continuen pendents.
7. **Cobertura i ordre.** `GameDetailPage` necessita un exemplar o experiència per obrir l’editor: una fitxa òrfena no té detall complet. A més, `getCatalog` no pagina, mentre que les còpies sí que ho fan; la futura revisió necessita lectura completa/paginada perquè no ometi resultats sota un límit de resposta. Proposta: decidir el detall d’un joc sense registres vinculats i assegurar paginació abans d’afirmar que s’ha revisat tota la base.
8. **Conservació de camps no editables.** El client no envia sinopsi, gèneres secundaris ni origen en un desament normal. Cal revisar el SQL de `desar_registre` per confirmar que l’omissió preserva aquests camps. La preservació de `revisat` s’ha fet explícita al payload en aquesta tanda. L’alta manté el valor inicial existent `revisat: true`; no canvia cap fila preexistent.

## Proposta: Revisió de dades a Configuració

Proposta original, conservada com a context de l’auditoria. La versió actual implementada i autoritzada es documenta a [REVISIO-DADES.md](REVISIO-DADES.md). Primera proposta d’àmbit: només propietari, sense escriptures automàtiques ni diagnòstics que etiquetin els resultats com a errors. L’accés dels convidats a aquesta eina requereix una decisió; Configuració actual està restringida al propietari.

### Camps candidats i àmbits

| Grup | Camps proposats per a la primera selecció | Abast i excepcions |
| --- | --- | --- |
| Joc | Nom, plataforma, desenvolupadora, gènere principal, any de llançament, portada, comentaris compartits i valoració. | Una fila per `fitxes_joc`, encara que tingui diversos exemplars/experiències. Valoració i comentaris com a consultes opcionals, sense prioritat d’error. |
| Col·lecció | Regió, conservació, any de compra, preu i botiga/servei. | Una fila per exemplar actiu; opció explícita d’incloure retirats. Permetre acotar físic/digital; un camp fora del seu àmbit no és un error. |
| Bitàcora | Any de joc i completat. | Una fila per experiència. Per defecte separar els registres de seguiment sense any de les entrades anuals; incloure’ls només amb opció explícita. |

No proposar a la primera selecció `revisat`, identificadors, propietari, timestamps, `origen`, `portada_visual_url` ni valoracions/notes antigues de compatibilitat. Favorit, Jugant, Per jugar aviat, canvi i reproducció són booleans: false és un valor vàlid, no «buit». Una futura consulta «estat desconegut» per `no_localitzat` (nul) o infants (si l’esquema real ho permet) hauria de ser diferenciada, sense tractar undefined com a nul de base de dades.

Sinopsi i gèneres secundaris podrien afegir-se només després de decidir-ne la visibilitat/edició. No oferir revisió amb un botó Edita que no permet corregir aquell camp.

### Definició de buit proposada

| Tipus | Criteri de consulta | Valors que no són buits |
| --- | --- | --- |
| Text | `null`, cadena buida o només espais. | Text amb contingut, inclosos títols «0». |
| Any / preu | Només `null`. | Preu 0; números vàlids. Números fora de rang serien una validació diferent. |
| Valoració | `fitxes_joc.valoracio = null` només si l’esquema confirma la columna. | Qualsevol grau. El nul pot ser una decisió expressa; etiqueta neutral «Sense valoració», sense marca d’error. |
| Completat | `null`. | `no`, `si`, `no_aplicable`. |
| Portada | Sense `portada_fitxer` ni URL de portada amb contingut. | Un fitxer de portada restaurada encara que el URL original sigui buit. Un URL existent però que falla en xarxa és una consulta diferent. |
| Booleà | Només nul real si la columna admet nul i es decideix incloure aquesta consulta. | false i true. Propietat undefined del client indica compatibilitat desconeguda, no una dada absent confirmada. |

Si hi ha notes antigues amb contingut però falta el comentari compartit, proposar separar «Comentari compartit buit amb notes antigues» de «Sense cap comentari». Una contradicció de valoracions o notes és un problema de conciliació diferent, no un resultat buit. No inferir falta de valoració perquè `gameRating` torna nul davant d’un conflicte antic.

### Funcionament proposat

1. Escollir àmbit i camp d’un catàleg de camps validats, amb el criteri de buit visible. Acotar actius/retirats o físic/digital quan pertoqui.
2. Carregar tots els resultats amb paginació i permisos actuals; mostrar recompte real, nom/plataforma i context d’exemplar o any. No publicar dades ni executar cap correcció automàtica.
3. Obrir el detall en consulta, amb Anterior/Següent sobre la llista de resultats, conservant filtre i ordre. Edita només per al propietari. Els retirats conserven la consulta i el flux de recuperació existent.
4. Proposta de navegació: fixar la llista durant la visita, com fa el detall actual. Desar/desfer manté el mateix joc; un botó d’actualitzar resultats torna a aplicar el criteri, sense fer desaparèixer de cop la fitxa oberta. Tanca retorna a Revisió de dades amb el camp seleccionat.
5. Les fitxes sense cap exemplar o experiència necessiten primer un detall de joc propi: no crear un exemplar ni una entrada fictícia per permetre la revisió. Fins que això s’acordi, no afirmar cobertura completa dels camps del joc.

### Decisions que falten

- Favorit global de joc o específic d’exemplar, i tractament dels jocs no posseïts.
- Visibilitat i edició de sinopsi/gèneres secundaris; comportament dels camps condicionals.
- Revisar els camps addicionals i exclusions. La primera versió ja autoritza propietari, filtres de retirats/seguiment i actualització de resultats mantenint la fitxa oberta.
- Valoració/comentaris confirmats ja s’inclouen al selector sense marques d’error; queda pendent la conciliació dels valors antics i camps no disponibles.
- Contrastar l’esquema, els defaults i els RPC reals abans de preparar correccions de dades o del model.

## Verificació d’aquesta tanda

Retirats els controls Revisat/Sense revisar del catàleg i el detall. El desament conserva true/false de `revisat` tant en exemplars com en experiències. No s’han modificat tipus, còpies, CSV, SQL ni valors a Supabase.

Controls: TypeScript, ESLint, compilació, proves existents i comprovacions aïllades amb dades sintètiques de consulta/edició/desament/navegació, absència de controls de revisió i preservació de `revisat`. L’esquema real, el comportament efectiu dels RPC i les interaccions visuals en un navegador real no s’han verificat. Cap exemple d’aquesta auditoria conté registres personals.
