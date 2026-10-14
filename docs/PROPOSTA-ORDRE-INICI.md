# Ordre manual de Jugant i Per jugar aviat — descartat

**Descartada explícitament per l’usuari el 14 d’octubre de 2026. No implementar ni preparar migracions.**

Es conserva l’anàlisi anterior només com a historial. Les descripcions tècniques i proves que segueixen no són un pla actiu ni una petició d’autorització. Es manté l’ordre alfabètic existent; no s’ha implementat l’ordenació manual ni generat SQL.

## Diagnòstic

Els tipus i les migracions del projecte, juntament amb la captura privada de l’esquema contrastat, no tenen camps de posició a fitxes, exemplars o entrades. Tampoc s’hi identifica una RPC d’ordenació. `resum_jocs` ordena Jugant i Per jugar aviat per `lower(nom), id`. El client conserva aquest ordre i mostra els tres primers.

Jugant es deriva de les entrades amb `jugant=true`; Per jugar aviat és un booleà de la fitxa. Els canvis de pertinença passen per més d’un mecanisme: RPC d’altes/desament i actualitzacions de seguiment. No n’hi ha prou amb canviar l’ordre només al client o adaptar un únic botó.

No s’ha fet una nova consulta administrativa a Supabase. El diagnòstic es basa en codi i definicions ja contrastades; no es dona per descartat un canvi remot posterior desconegut. Abans d’aplicar res, caldrà verificar les definicions/guardes pertinents, agrupades i reutilitzant els materials disponibles.

## Canvi mínim proposat: requereix SQL

1. Dos camps de posició enters opcionals a `fitxes_joc`, per exemple `ordre_jugant` i `ordre_per_jugar_aviat`. Una posició per ID de joc i quadre, sense duplicar-la per exemplar o any de log. No canviar valoracions, comentaris, marques o vinculacions existents.
2. Inicialització dels membres actuals amb el mateix ordre alfabètic que serveix avui la RPC. Lectura de `resum_jocs` per posició, amb desempat estable per ID. Els quadres continuen tenint ordres completament independents.
3. Mecanisme de servidor que cobreixi totes les altes/entrades/sortides del quadre: nou membre al final, baixa sense renumerar els altres i reentrada al final. Jugant s’ha de calcular pel conjunt d’entrades del joc: canviar una entrada no el retira si encara n’hi ha una altra marcada. Gestionar-ho transaccionalment amb bloqueig coherent per propietari/quadre; no basar l’ordre en updated_at ni en l’edat de la fitxa. Restauració i eliminació de registres també s’han de revisar perquè no alterin inadvertidament la pertinença.
4. RPC d’ordenació amb IDs, quadre i estat esperat: comprovar sessió, `pot_editar`, propietat, absència de duplicats i correspondència amb els membres actuals. Desar l’ordre complet atòmicament; si un altre dispositiu ha canviat ordre o membres, retornar un error i conservar l’esborrany, sense sobreescriure cegament. Convidats només poden consultar amb les RLS existents. Revisar grants perquè els nous camps no introdueixin escriptura per a convidats.
5. Adaptar tipus, lectures i còpies/restauracions per conservar els ordres. Les còpies antigues sense aquests camps han de continuar llegint-se amb una regla explícita que no esborri un ordre existent en restauracions parcials. En recuperar una còpia antiga en base buida es pot reproduir l’ordre alfabètic anterior. Definir/provar les regles de restauració abans de preparar l’aplicació.

Això necessita una migració i canvis de funcions/triggers, a preparar i provar localment només després de la resposta de l’usuari. No s’ha escrit SQL, no s’ha modificat l’esquema remot i localStorage no s’utilitzarà per substituir la persistència compartida.

## Interacció proposada

- Acció discreta Ordena a cada quadre, només per al propietari. No afecta l’altre quadre.
- En activar-la, mostrar tots els jocs d’aquell quadre i treballar amb una còpia local de l’ordre desat. Controls Abans/Després o fletxes amb noms accessibles «Mou [títol] abans/després», superfície adequada per al mòbil i focus visible. Primer/últim deshabilitats quan correspon; el focus acompanya el mateix joc després de moure’l. Arrossegar seria opcional, mai l’única via.
- Desa envia l’ordre complet a la RPC; només després de confirmar l’èxit es pren com a ordre desat i es refresca el resum. Els tres primers d’aquest ordre són els que es veuen inicialment en mode normal.
- Cancel·la descarta l’esborrany i manté l’ordre anterior. Protegir la sortida amb esborrany pendent i conservar-lo davant error de xarxa. En respostes incertes, rellegir abans de donar el desament per fallat o repetir-lo.
- Convidats veuen el mateix ordre desat sense controls. Quadres buits continuen compactes; l’estat normal +N/− i les portades/enllaços es conserven.

## Validació a preparar després de l’autorització

Proves sintètiques: ordres independents, primers tres, teclat/abans/després, Desa/Cancel·la/errors, membres nous al final, retirada sense alterar els altres, diferents anys del mateix joc, reentrada, dos dispositius/concurrència, permisos propietari/convidat, còpies antigues/noves i recuperació de les definicions/dades afectades.

Revisió real al navegador i persistència entre dispositius quedarien diferenciades de les proves locals. Abans d’aplicar SQL remot, presentar pla, comprovacions agrupades i recuperació; no aplicar-lo com a part d’aquesta preparació.
