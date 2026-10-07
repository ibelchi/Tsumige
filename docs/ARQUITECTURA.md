# Arquitectura

## Dades

Una mateixa base de dades Supabase relaciona quatre peces principals:

| Peça | Què conserva |
| --- | --- |
| `fitxes_joc` | Identitat i plataforma del joc, portada i atribució, gènere, valoració única, comentaris, seguiment i marca per jugar amb infants. |
| `exemplars` | Propietat física/digital, regió, compra i preu, favorit, intercanvi, reproducció, no localitzat i retirada de la col·lecció. |
| `experiencies` | Entrades de joc de diferents anys, resultat i seguiment. També admet jocs que no es posseeixen. |
| `proposits` | Text, any i estat pendent/fet/descartat. |

Retirar un exemplar no elimina la història del joc. Les notes i valoracions importades antigues es conserven fins a la seva conciliació; la interfície utilitza el comentari i la valoració únics del joc. Els camps buits no s’interpreten com a zero, com a no jugat ni com a valoració negativa.

La lectura està protegida amb RLS. Els convidats assignats al propietari poden consultar i no editar. Les funcions `desar_registre` i `crear_registre` desen dades relacionades; `resum_jocs` prepara les dades de l’inici. `pot_editar` determina els controls d’edició. Les polítiques continuen sent la protecció efectiva encara que es manipuli la interfície.

## Imatges

La funció `game-metadata` consulta RAWG i `bright-worker` consulta IGDB. Les credencials són secrets de les funcions de Supabase. La web només rep les dades del resultat escollit; no modifica automàticament camps sense confirmar la selecció.

Les portades es mostren des dels URL guardats. El ZIP de seguretat descarrega també els fitxers disponibles: `dades.json`, `portades/`, `portades.json` i `LLEGEIX-ME.txt`. Els URL compartits es descarreguen una sola vegada. Es registren els jocs sense portada i qualsevol error de descàrrega.

La còpia limita cada imatge a 20 MB i el conjunt d’imatges a 200 MB, amb tres descàrregues simultànies i un termini de 30 segons per imatge. Els errors de xarxa, els límits o les restriccions de descàrrega del proveïdor es mostren; no s’oculten com una còpia completa.

## Publicació

El repositori Tsumige és la font del programa. GitHub Actions publica la compilació a `/Tsumige/` sense incloure les dades de Supabase. La navegació utilitza el fragment de l’URL per permetre obrir i recarregar seccions a GitHub Pages.

El blog i l’aplicació tenen publicacions independents. Editar registres afecta Supabase; pujar codi afecta la interfície. No cal repujar el programa després d’editar un joc.
