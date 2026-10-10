# Revisió de dades

Primera versió local, autoritzada el 9 d’octubre de 2026. Configuració → Revisió de dades. Només el propietari hi té accés; la consulta habitual dels convidats continua disponible. L’eina no marca registres, no corregeix dades automàticament ni executa migracions. Edita obre el circuit d’edició existent, amb els seus permisos i confirmacions.

## Àmbits i criteris

| Àmbit | Camp | Criteri de buit |
| --- | --- | --- |
| Joc | Plataforma | Nul, buit o només espais; no deduir una botiga de l’exemplar. |
| Joc | Portada | URL nul/buit/només espais i cap referència de fitxer guardat amb contingut. Un URL que falla no es considera absent. |
| Joc | Gènere principal | Nul, buit o només espais. |
| Joc | Valoració | Valoració del joc explícitament nul·la. Una valoració absent pot ser una decisió expressa. No s’interpreta el fallback antic com una dada canònica. |
| Joc | Comentaris | Camp compartit nul/buit/només espais, sense notes antigues amb contingut en cap exemplar o entrada. |
| Col·lecció | Any de compra | Nul en l’exemplar seleccionat. |
| Col·lecció | Preu de compra | Nul en l’exemplar seleccionat; zero euros és informat. |
| Bitàcora | Completat | Nul. Sí, No i No aplicable són valors informats. |

Una propietat opcional no carregada (`undefined`) indica manca d’informació confirmada, no buit. False tampoc és buit. No s’ofereixen booleans, identificadors, procedència, marques de revisió d’importació ni temps tècnics. Any/preu de compra només s’apliquen a exemplars, mai a entrades de Bitàcora ni directament al joc. Els exemplars històrics d’Emulador no generen resultats de compra; es conserven i es presenten al diagnòstic de conversió separat.

Col·lecció consulta exemplars actius per defecte; permet incloure retirats i seleccionar físic/digital. Bitàcora consulta entrades amb any; l’opció Inclou seguiment sense any incorpora els registres de seguiment. El camp Any de joc queda fora: un registre sense any pot ser precisament seguiment, i no s’ha acordat distingir-lo d’una entrada anual incompleta. Regió, conservació i botiga/servei queden fora fins a decidir-ne l’aplicabilitat. Sinopsi i gèneres secundaris no s’ofereixen perquè el detall actual no els edita.

## Resultats i detall

- Joc: una fila per identificador de fitxa, encara que tingui diversos exemplars. Col·lecció i Bitàcora: una fila per exemplar o entrada. La cerca per títol només filtra la llista; mai crea vinculacions.
- Títol, plataforma i context del registre permeten distingir resultats. Es conserva l’identificador per distingir duplicats amb dades iguals.
- Per obrir un joc s’ofereixen els seus exemplars actius; si no en té, les entrades de Bitàcora; si tampoc en té, els exemplars retirats. Una única vinculació s’obre directament. Si en té diverses, l’usuari escull explícitament. No s’escull la primera arbitràriament.
- Les fitxes sense cap registre vinculat es compten com a no consultables i no tenen un botó que inventi un exemplar/entrada. Queda pendent un detall propi de fitxa de joc.
- El detall s’obre en consulta amb Anterior/Següent a dalt i a baix. Es conserven el camp, l’àmbit, la cerca i els filtres en tancar.
- S’enregistra l’ordre dels resultats en obrir. Després de desar es recarreguen les dades i la llista reflecteix el nou filtre. El registre obert es manté com a punt de navegació encara que deixi de complir-lo; no salta a un altre. La resta de resultats que ja no coincideixen es retiren de la navegació. Actualitza els resultats torna a carregar la consulta sense perdre els filtres. Els resultats nous s’incorporen en tornar a obrir des de la llista, sense alterar l’ordre durant la visita.
- Si la recàrrega falla, el detall conserva l’esborrany i mostra l’error existent. Navegar/tancar continua protegint els canvis pendents.

## Lectura i límits

Lectura específica paginada de fitxes, exemplars i experiències: blocs de 500, ordenats per ID i restringits al propietari. Es comproven `pot_editar` i la sessió, i s’utilitzen les polítiques existents. Aquesta lectura no depèn del límit del catàleg habitual ni descarrega còpies/propòsits. Com en les lectures actuals, no és una instantània transaccional de diverses taules: canvis simultanis des d’una altra sessió poden requerir tornar a carregar Configuració.

Els jocs sense el camp opcional carregat i els comentaris buits amb notes antigues es compten com a exclosos, sense fusionar ni descartar informació. Les contradiccions antigues de valoració amb columna canònica absent no s’infereixen com una valoració buida. Favorit i la conciliació de notes/valoracions continuen pendents de les decisions de [l’auditoria](AUDITORIA-DETALL.md).

No s’ha consultat l’esquema real ni verificat els RPC reals. Aquesta versió utilitza els tipus i les relacions del client, i reconeix els camps disponibles en la resposta. No modifica el model de dades.

## Verificació

Proves sintètiques a `tests/data-review.test.ts`: null, text buit/espais, zero, false, camp no carregat/no aplicable, portada guardada, notes antigues, exemplars múltiples, retirats, físic/digital, seguiment sense any, relacions per ID i actualització de la navegació després d’editar. Afegides als controls de GitHub Actions, sense publicar aquesta tanda.

Comprovacions aïllades del component: accés propietari/convidat, conservació de filtres, detall inicial de consulta, límits, desament amb desaparició del resultat i continuació al següent sense salt automàtic. Lectura també comprovada amb 1001 registres sintètics per taula, denegació de convidat, error de lectura i canvi de sessió. Regressions del detall anterior i proves existents executades sense escriure a Supabase. En aquest Node local les proves TypeScript s’han compilat temporalment amb esbuild abans d’executar-les; GitHub Actions conserva l’execució nativa amb Node 22.

No hi ha navegador disponible en aquest entorn. Revisió manual pendent en escriptori i mòbil: selector d’àmbit/camp, filtres, llista compacta, selector entre vinculacions, focus/Esc, portada al detall i Anterior/Següent. Amb una base de proves, comprovar desament/desfés/error i desaparició del resultat mantenint la fitxa oberta; evitar editar dades reals només per provar.
