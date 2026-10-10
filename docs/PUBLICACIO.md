# Publicació i manteniment

## Circuit habitual

1. Modificar el programa en el checkout local de Tsumige.
2. Comprovar TypeScript, ESLint, les proves necessàries i la compilació.
3. Revisar els canvis a la interfície local.
4. Pujar els canvis a `main` de `ibelchi/Tsumige`.
5. Esperar que el workflow «Publica Tsumige» acabi correctament i comprovar la web.

El repositori del blog no necessita una còpia del programa ni un token amb accés a Tsumige. Manté un enllaç a https://ibelchi.github.io/Tsumige/. L’adreça antiga `/tsumige/` pot mantenir una redirecció de compatibilitat, inclosos els filtres i les seccions.

## GitHub Pages

Al repositori Tsumige, seleccionar **Settings → Pages → Source: GitHub Actions**. El workflow `.github/workflows/pages.yml` publica l’artefacte `dist/` amb els permisos `pages: write` i `id-token: write` del treball de desplegament. Les comprovacions del treball de compilació s’executen abans de publicar.

La base de recursos és `/Tsumige/`, sensible a majúscules. La URL pública i la clau publishable de Supabase són configuració del client; no s’hi han d’introduir claus secret, service_role ni credencials d’IGDB/RAWG. Per utilitzar un Supabase propi, adaptar la configuració pública i preparar l’esquema i les polítiques.

## Tornar enrere

Revertir el commit que introdueix un problema i tornar-lo a pujar. La compilació anterior del blog es conserva durant la migració; només es retira quan la publicació independent es verifica. Cap d’aquestes operacions ha de modificar les dades de Supabase.

## Còpies privades

Descarregar periòdicament el ZIP des de Configuració i comprovar l’informe de portades. Guardar-lo fora del repositori públic. Les exportacions CSV serveixen per consultar les dades; no substitueixen la còpia completa. Des de «Recupera una còpia» es pot revisar un ZIP del mateix compte. Per defecte només afegeix registres absents; actualitzar els existents requereix seleccionar-ho i confirmar-ho. No elimina registres. Abans de sobreescriure es descarrega una còpia actual; comprovar que s’ha desat.

## Recuperació i restauració

Aplicar `supabase/migrations/202610070006_restauracio.sql` sobre l’esquema existent. Les proves `supabase/tests/restauracio.sql` creen dades temporals i les reverteixen al final.

A Authentication → URL Configuration, autoritzar exactament https://ibelchi.github.io/Tsumige/?recuperacio=1. Si es prova en local, autoritzar també l’URL concreta de l’entorn local. El correu de recuperació l’envia Supabase; els límits i el servei de correu del projecte condicionen la recepció. La contrasenya nova l’introdueix l’usuari.

## Publicació posterior a Plataforma

La conversió transaccional del pla 002 ja s’ha aplicat una vegada per l’autor, amb verificació posterior correcta i comprovacions funcionals locals confirmades. Publicar el client compatible no requereix executar cap SQL. El workflow només valida, compila i desplega el lloc; no aplica migracions ni modifica Supabase.

Els SQL d’inspecció, generadors i proves del repositori són genèrics. Informes reals, CSV, ZIP, plans per identificadors i bundles/SQL generats de reversió es custodien fora del repositori. La migració de referència no s’ha de repetir sobre aquesta base. Una reversió de Git no substitueix la reversió de dades: el client publicat ha de continuar sent compatible amb l’esquema vigent.

La verificació pública ha de relacionar el workflow amb el commit publicat i contrastar els recursos servits per Pages amb l’artefacte desplegat. Això acredita el lliurament de la versió, no les interaccions autenticades. Les comprovacions funcionals locals comunicades per l’usuari es registren com a confirmació de l’usuari; Auth/Storage, restauració remota i navegador públic no es donen per verificats sense executar-ne les proves.
