import type { Catalog } from '../../src/lib/catalog'
import type { FitxaJoc, Exemplar, Experiencia } from '../../src/lib/database.types'
export function homeSummaryFixture(): Catalog {
 const stamp={user_id:'synthetic-owner',created_at:'2026-01-01',updated_at:'2026-01-01'}
 const base={...stamp,nom:'Títol repetit',plataforma:'PC',plataforma_resolta:true,desenvolupadora:'Estudi sintètic',genere_principal:'Acció',generos_secundaris:[],any_llancament:2020,sinopsi:null,portada_url:null,portada_font_url:null,comentaris:'Comentaris sintètics',per_infants:false,no_jugat:false,intencio_joc:null,per_jugar_aviat:false}
 const jocs=[
  {...base,id:'a',valoracio:'A+',intencio_joc:'vull',no_jugat:true,per_infants:true},
  {...base,id:'b',valoracio:'A++',plataforma:'Nintendo Switch'},
  {...base,id:'c',nom:'Un joc D',valoracio:'D',plataforma:'Steam',intencio_joc:'vull'},
  {...base,id:'d',nom:'Sense valoració',valoracio:null,plataforma:'PlayStation 4',genere_principal:'Puzle',no_jugat:true},
  {...base,id:'e',nom:'Un joc B',valoracio:'B',intencio_joc:'no_vull'},
  {...base,id:'only-log',nom:'Només log',valoracio:'A++',plataforma:'Emulador',intencio_joc:'vull'},
  {...base,id:'historical',nom:'Històric',valoracio:'D'},
  {...base,id:'emulator',nom:'Exemplar invàlid Emulador',plataforma:'Emulador',valoracio:'A++'},
 ] as FitxaJoc[]
 const copy={...stamp,a_la_colleccio:true,favorit:false,canvi:false,reproduccio:false,no_localitzat:null,regio:null,estat_conservacio:null,any_compra:null,preu:null,botiga_servei:null,notes:null,revisat:false}
 const exemplars=[{...copy,id:'a-physical',joc_id:'a',format:'fisic',favorit:true},{...copy,id:'a-digital',joc_id:'a',format:'digital'},
  {...copy,id:'b-physical',joc_id:'b',format:'fisic'}, {...copy,id:'c-digital',joc_id:'c',format:'digital'},
  {...copy,id:'d-physical',joc_id:'d',format:'fisic'}, {...copy,id:'e-digital',joc_id:'e',format:'digital'},
  {...copy,id:'historical-copy',joc_id:'historical',format:'fisic',a_la_colleccio:false},
  {...copy,id:'emulator-copy',joc_id:'emulator',format:'digital'}] as Exemplar[]
 const entry={...stamp,completat:null,notes:null,jugant:false,revisat:false}
 const experiencies=[{...entry,id:'a-2025',joc_id:'a',any_jugat:2025,valoracio:'A+'},{...entry,id:'a-2026',joc_id:'a',any_jugat:2026,valoracio:'A+'},{...entry,id:'log-only',joc_id:'only-log',any_jugat:2026,valoracio:'A++'}] as Experiencia[]
 return {jocs,exemplars,experiencies,plataformaModel:2}
}
