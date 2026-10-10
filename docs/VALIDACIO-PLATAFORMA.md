# Plataforma: informe d’esquema per al SQL Editor

## Estat vigent: conversió aplicada i verificada

El 10 d’octubre de 2026 l’autor ha executat una vegada el script transaccional privat del pla 002. Els informes posteriors rebuts confirmen `coincideix=true`, cap diferència, totes les fitxes resoltes i els recomptes aprovats. Es preserven identificadors, compres, comentaris, valoracions, Bitàcora i propòsits; només els tres digitals aprovats passen a històrics inactius. El ZIP previ, les captures anteriors/posteriors i el material de reversió complet estan verificats i custodiats fora del repositori. La reversió no s’ha executat.

L’usuari confirma que les comprovacions funcionals locals de Plataforma han passat. És una confirmació de l’usuari, no una prova de navegador executada per l’agent ni una verificació de la versió publicada. Continuen pendents les restauracions i recuperacions remotes, els serveis Auth/Storage no comprovats explícitament i la concurrència multiclient. Les restauracions v1/v2 i la inversa acotada estan provades localment amb dades sintètiques.

Les seccions següents conserven l’historial de preparació; les indicacions «pendent», «no aplicat» i «no autoritzat» d’aquelles fases queden substituïdes per aquest estat. **No repetir la migració ni la conversió.** Les propostes de l’auditoria alienes a Plataforma continuen obertes. La publicació del codi s’ha autoritzat separadament.

Consulta preparada el 10 d’octubre de 2026, sense migració, conversió ni publicació. Els **453 són fitxes pendents**, no discrepàncies. Els tres casos físic/digital ja estan resolts; aquesta consulta no llegeix ni reconsidera els seus registres.

## Fitxer que cal obrir

[PLATAFORMA-ESQUEMA-LECTURA.sql](../supabase/inspection/PLATAFORMA-ESQUEMA-LECTURA.sql)

Ruta Linux:

```text
/home/belchi/projectes/Tsumige/supabase/inspection/PLATAFORMA-ESQUEMA-LECTURA.sql
```

Des de Windows, enganxa aquesta ruta a la barra d’adreces de l’Explorador. Obre el fitxer amb Bloc de notes o VS Code:

```text
\\wsl.localhost\Ubuntu-26.04\home\belchi\projectes\Tsumige\supabase\inspection\PLATAFORMA-ESQUEMA-LECTURA.sql
```

És text UTF-8, amb una sola consulta `WITH … SELECT`. No cal canviar cap valor ni introduir IDs, contrasenyes o tokens.

## Com executar-la

1. Obre el Dashboard de Supabase i selecciona el projecte de Tsumigē.
2. Entra a **SQL Editor** i crea una consulta nova (**New query**).
3. Copia **tot el contingut** de `PLATAFORMA-ESQUEMA-LECTURA.sql` i enganxa’l a l’editor.
4. Executa amb **Run**, utilitzant el rol d’inspecció habitual del SQL Editor (`postgres`, si és l’opció disponible). No cal simular el propietari de l’aplicació: només es llegeixen metadades. Si manca permís per llegir catàlegs o configuració del bucket, retorna l’error; aquesta tanda no atorga permisos.
5. El resultat és **una fila i una columna**, `informe_esquema`, amb JSON indentat. Si es produeix un error, desa el text de l’error i el número de línia. No substitueixis la consulta per cap fitxer de `supabase/migrations` o `supabase/tests`.

No s’executa cap RPC de l’aplicació: només se’n llegeixen les definicions. No hi ha INSERT, UPDATE, DELETE, ALTER, CREATE, GRANT, migracions ni funcions que escriguin. La consulta s’ha provat dins d’una transacció PostgreSQL local `READ ONLY`; això verifica la consulta amb l’esquema sintètic, no l’esquema remot.

## Què recull

- Columnes/defaults/tipus, restriccions, índexs i triggers de `fitxes_joc`, `exemplars`, `experiencies`, `proposits`, `accessos_convidats` i les dues taules de Storage implicades.
- RPC d’alta, desament, resum, permisos, restauració i Plataforma si existeixen; funcions de triggers/polítiques i dependències registrades al catàleg. Inclou els auxiliars Auth de context i Storage de rutes.
- RLS activada/forçada, expressions de les polítiques, ACL i permisos efectius dels rols d’API/Storage, inclòs bypass RLS. Només configuració `search_path` i `row_security` de funcions.
- Bucket **tsumige-portades**: públic/privat, límit de mida i MIME. S’inclouen totes les polítiques de `storage.objects`/`storage.buckets`, perquè una regla general també pot afectar aquest bucket.
- Objectes i RPC absents. Les RPC de Plataforma absents abans de migrar són esperables.

No consulta files de jocs, exemplars, Bitàcora, propòsits, accessos de convidats o `auth.users`; tampoc noms/rutes/propietaris de fitxers de `storage.objects`, Vault, credencials o contingut d’imatges. L’única fila de configuració consultada és la del bucket indicat.

Redacció addicional de UUID, correus i literals llargs susceptibles de ser tokens, també dins de polítiques/defaults/definicions. Un cos de funció amb indicis de credencials s’omet sencer amb un avís. Això pot ocultar també algun literal tècnic: no s’inventa el que manca. Les definicions administratives poden contenir altres literals o comentaris particulars; revisa el resultat abans d’enviar-lo i substitueix qualsevol valor privat que hi detectis per `[OMES]`. No cal retornar aquest valor original per provar amb usuaris sintètics.

`pg_depend` no garanteix descobrir totes les crides PL/pgSQL o SQL dinàmic. En contrastar els cossos, si falta un auxiliar es prepararà una consulta addicional limitada a aquella definició. Aquest informe tampoc verifica totals, vincles o discrepàncies dels registres, ni el funcionament real de l’API d’Auth/Storage.

## Com retornar el resultat

1. Copia el **contingut complet de la cel·la** `informe_esquema` i desa’l, per exemple, com `tsumige-esquema-plataforma.json`. Comprova que comença amb `{` i acaba amb `}`: la vista pot mostrar només una part del text.
2. Si el SQL Editor ofereix **Export / Download CSV**, també pots descarregar el resultat com `tsumige-esquema-plataforma.csv`; s’accepta amb les cometes i salts de línia originals. No cal convertir manualment el CSV en JSON.
3. Guarda’l fora del repositori, per exemple a Descàrregues de Windows. **Adjunta el fitxer aquí**, o indica la ruta local completa perquè es pugui llegir des de WSL. No l’afegeixis a GitHub. Per a un resultat breu també pots enganxar-ne el text, conservant-lo sencer.
4. Si hi ha errors o camps `COS OMES`, retorna també aquests avisos. No enviïs contrasenyes, tokens, exportacions de dades personals ni còpies de seguretat.

Amb el resultat es contrastaran columnes, signatures/cossos, triggers, RLS i Storage amb la migració preparada. Es recrearà l’esquema necessari en una base local amb identificadors/usuaris/dades sintètiques; els literals personals redactats no es recuperaran. Només llavors es repetiran migració, conversió per IDs, restauracions v1/v2 i proves de permisos amb aquest esquema. Les API de Storage/Auth requeriran Supabase local per verificar-les; PostgreSQL incrustat només verifica el SQL. Cap d’aquests passos aplica canvis al projecte real ni autoritza publicar.

## Resultat rebut i contrast local

L’autor ha retornat l’informe CSV. Llegit privadament, fora del repositori: 7 taules, 87 columnes, 23 funcions, 15 triggers i 26 polítiques. Els objectes esperats són presents; les RPC de Plataforma encara absents corresponen a la migració no aplicada. Cap cos de RPC públic necessari està omès.

Esquema públic reconstruït **des d’aquest informe**, conservant ordre/tipus/defaults/nullabilitat de columnes, claus/checks/índexs, cossos reals de RPC, triggers i polítiques RLS. Els noms de dues restriccions llargues redactades s’han substituït per noms locals: les definicions de les restriccions es preserven. `auth.users` conté només IDs sintètics; es reutilitzen les definicions de context `auth.uid/role/jwt`. L’informe original no s’ha incorporat al repositori.

Execució local reproduïble amb PGlite instal·lat com a la proposta:

```sh
node supabase/tests/local/real-schema.mjs '/ruta/privada/informe.csv'
```

També accepta JSON. Tot s’executa en una base PostgreSQL **en memòria**, sense connexió a Supabase. El programa no transforma l’informe en una migració remota ni en publica el contingut.

Resultats superats:

- Aplicació local de la migració de Plataforma sobre l’esquema públic reconstruït, sense tornar a aplicar la migració de restauració ja present al servidor.
- Conversió sintètica de 453 fitxes: 453 fitxes i IDs conservats; 6 exemplars totals conservats; 6→3 actius, 3 físics conservats; 6 entrades de Bitàcora conservades. Empremta antiga i pla incomplet rebutjats, amb rollback íntegre.
- Restauració completa v1 en base buida i v2 en base buida/sobre existents, amb les RPC i els triggers reals. Bloqueig de v1 sobre fitxes resoltes.
- Alta real via RPC preparada, normalització d’Epic, afegir entrades al mateix joc, desament de zero/preu, any null, favorit, infants i comentaris; valoració sincronitzada pels triggers de l’informe. Proteccions de plataforma, formats i Emulador.
- Convidat consulta però no escriu ni converteix/restaura; un altre compte no veu les dades alienes; anònim no pot executar la conversió. `pot_editar` real considera editor qualsevol autenticat que no figuri com a convidat; les dades de cada editor continuen aïllades per `user_id` i RLS. No s’ha canviat aquesta política.
- RLS reals de Storage sobre objectes ficticis: carpeta pròpia, consulta del propietari i convidat, rebuig d’alta/eliminació del convidat i d’accés aliè. Referència de portada conservada en restaurar. Reutilitzat també el trigger real que rebutja DELETE SQL directe; eliminació local amb context de servei simulat i RLS contrastada.
- Timestamps antics: `created_at`, dades/metadata dels físics i tota Bitàcora es conserven. Els triggers existents actualitzen `updated_at` dels jocs convertits i digitals retirats; no es considera una pèrdua de dades. La restauració evita reescriure el marcador si ja té el valor correcte.

**Correcció trobada gràcies a les RPC reals:** la variable `plataforma` de l’RPC d’alta preparada era ambigua amb la columna homònima. Renomenada `v_plataforma` i verificades les altes/desaments. La migració segueix local i no aplicada a Supabase.

Storage es reconstrueix **parcialment**: les RLS, l’auxiliar de rutes i la protecció DELETE es proven amb les definicions rebudes, però les taules són el suport mínim local de restauració. La redacció va ocultar identificadors tècnics llargs, parts d’ACL i interns de lifecycle de Storage; no se’n dedueixen els originals. No s’ha reproduït tot el servei ni verificat upload/download, URL signades, MIME/mida a través de l’API, JWT real, PostgREST ni navegador. El bucket reportat és privat, límit 20 MiB i MIME JPEG/PNG/WebP/GIF/AVIF.

Les claus validades reals `(joc_id,user_id)` exigeixen un joc existent del mateix propietari; `joc_id` és obligatori. Les polítiques SELECT permeten al propietari llegir les seves files completes. Això reforça el contrast estructural de cobertura, però aquest informe **no inclou recomptes ni files**: falta reobrir el diagnòstic amb lectura exacta per confirmar totals i els IDs concrets de retirada. Els 453 són fitxes pendents i els tres conflictes resolts no es reobren.

No s’ha executat cap consulta contra Supabase des d’aquesta sessió, cap conversió real ni publicació. Encara calen el pla privat per IDs/compres aprovades i la còpia prèvia abans d’una futura aplicació autoritzada; els passos continuen a [PROPOSTA-PLATAFORMA.md](PROPOSTA-PLATAFORMA.md).
