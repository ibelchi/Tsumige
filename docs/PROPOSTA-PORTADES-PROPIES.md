# Proposta de portades pròpies

Anàlisi del 14 d’octubre de 2026. **Proposta pendent d’aprovar i implementar**. Cap pujada, RPC, SQL o modificació de dades real executada.

## Infraestructura reutilitzable i límits del contrast

- `tsumige-portades` és privat segons la migració de restauració i la captura d’esquema contrastada conservada privadament: límit de 20 MiB i MIME JPEG, PNG, WebP, GIF i AVIF. No s’ha fet una consulta administrativa nova a la instància ni provat avui Storage/Auth reals; aquests valors són els documentats/capturats, sense garantir que no hagin canviat després.
- Les polítiques existents permeten SELECT a l’usuari autenticat amb la carpeta del propietari resolt per `propietari_consulta`, inclosos els seus convidats. INSERT/DELETE requereixen `pot_editar` i carpeta inicial igual a l’ID autenticat. No cal bucket públic ni donar escriptura als convidats. No es pressuposa UPDATE/upsert: la restauració ja puja objectes nous amb `upsert: false`.
- `fitxes_joc.portada_fitxer` guarda la ruta privada; `portada_url` i `portada_font_url` guarden imatge externa i atribució. `portada_visual_url` és derivat de client, no persistent. `coverUrl`/`withStoredCovers` generen URL signades d’una hora i prioritzen el fitxer guardat.
- El desament actual envia URL/font a `desar_registre_plataforma`, que delega en `desar_registre`. La definició capturada d’aquest últim no gestiona `portada_fitxer`. El trigger `portada_canviada` esborra la referència antiga si canvia l’URL sense canviar alhora el fitxer: cal tractar els tres valors de manera coherent.

## Recorregut proposat

1. Només en edició del propietari, a Configuració del detall: botó accessible «Selecciona una portada», nom del fitxer i previsualització local. Els convidats continuen amb consulta sense controls de pujada.
2. Seleccionar no puja ni desa res. Previsualització amb URL d’objecte temporal, sempre amb proporcions conservades; alliberar-la quan es canvia, es descarta o es tanca. Integrar el fitxer pendent en la protecció existent dels canvis sense desar.
3. Proposta inicial: JPEG, PNG i WebP, amb límit màxim de 20 MiB o el límit real del bucket si és inferior. Validar mida no nul·la, signatura/contingut i descodificació real, no només extensió/MIME declarat. Fixar també un límit de dimensions/píxels abans de la implementació. GIF/AVIF es poden valorar després; no canviar el suport de les portades antigues. SVG no s’acceptaria per a aquesta pujada. L’atribut `accept` només orienta el selector, no substitueix la validació.
4. Només en prémer Desa: pujar a una ruta nova no previsible, sota la carpeta de l’usuari, amb UUID i extensió validada; no sobreescriure l’objecte antic ni incloure noms personals del fitxer original en la ruta.
5. Confirmar totes les dades del joc/exemplar/entrada i la referència de portada en una mateixa transacció de base de dades, comprovant propietat, edició i existència/ruta de l’objecte. La portada és del joc i afecta tots els exemplars i entrades vinculats al seu ID.
6. En èxit, mostrar el mateix detall en consulta amb la nova imatge. Per a una pujada manual: `portada_fitxer` nou, `portada_url = null`, `portada_font_url = null`. No inventar una URL externa, una atribució IGDB/RAWG ni una font fictícia. Les atribucions reals de portades externes continuen funcionant en la resta de jocs.

## Cancel·lació, errors i recuperació

- Cancel·lar/Desfer abans de Desa només elimina l’esborrany local: portada anterior i dades desades intactes.
- Error validant o pujant: conservar esborrany i portada anterior. Error inequívoc de transacció: rollback de totes les dades; l’objecte nou no esdevé portada activa. Es pot netejar l’objecte nou només si es confirma que no està referenciat.
- Storage i PostgreSQL no comparteixen una transacció distribuïda. Si es perd la resposta de desament, no afirmar que ha fallat ni eliminar el fitxer nou: rellegir l’estat/identificador de petició per confirmar el resultat i permetre un reintent segur.
- No eliminar automàticament la portada antiga en aquesta primera versió. La neteja posterior d’objectes sense referències seria una tasca separada, amb comprovacions i còpia prèvia; no confondre una ruta antiga amb un fitxer que es pot eliminar sense risc.

## Convidats i còpies

- Reutilitzar les URL signades i les RLS actuals; provar propietari, convidat assignat, usuari aliè i anònim. Preveure renovar les URL signades en sessions llargues; no desar-les com a URL permanent ni posar-les al ZIP com a identitat de la portada.
- **Dependència de client obligatòria abans d’usar portades pròpies:** `buildBackupArchive` només inclou jocs amb `portada_url` i deduplica per URL. Una portada manual amb només `portada_fitxer` quedaria exclosa avui. Cal recollir fitxer privat O URL, deduplicar per origen real/ruta i vincular el fitxer del ZIP a cada ID de joc.
- Adaptar el manifest i la validació/restauració per admetre imatges manuals amb URL nul·la. Proposta: manifest de portades v2 amb origen explícit extern/fitxer, mantenint lectura del manifest v1 i de les dades de còpia v1/v2. Els clients antics han de rebutjar clarament el nou manifest; no simular una URL HTTP per evitar aquesta dependència.
- La restauració actual ja puja els bytes amb una ruta nova del compte i assigna `portada_fitxer` al payload. Reutilitzar-la, adaptant tipus/validacions i recomptes de sense portada versus errors de descàrrega. Comprovar round-trip d’una portada manual, externa i recuperada, propietari correcte i atribució nul·la per la manual.

## Dependències i passos abans d’implementar

**Avís explícit de SQL:** es recomana ampliar el desament transaccional existent per gestionar i validar `portada_fitxer` juntament amb la resta dels canvis. Això requeriria una modificació de RPC i executar SQL a Supabase més endavant. No s’ha preparat ni executat aquest SQL. No es proposa cap columna nova ni obrir el bucket. Una escriptura separada des del client no ofereix la garantia de conservació davant errors que es demana.

Abans de preparar aquesta part: confirmar l’enfocament, reutilitzar les definicions contrastades i comprovar només l’estat que falti de RPC/polítiques/bucket, agrupat en una lectura. Advertir l’usuari abans de generar qualsevol migració; preparar llavors proves locals i recuperació de les definicions anteriors. No demanar exportacions successives ja cobertes per guardes.

Decisions agrupades pendents: formats inicials i límit de píxels; aprovar l’ampliació de RPC; aprovar l’evolució compatible del manifest ZIP. Després caldran proves sintètiques de cancel·lació/error/reintent/concurrència, propietari/convidats, URL signades i backup/restauració, i revisió real al navegador. Les proves manuals d’altes prèviament ajornades continuen pendents i són independents d’aquesta proposta.
