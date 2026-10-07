export type FormatJoc = 'fisic' | 'digital' | 'rom'
export type EstatJoc = 'pendent' | 'jugant' | 'completat' | 'abandonat'
export type Valoracio = 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D'

export type Joc = {
  id: string
  user_id: string
  nom: string
  plataforma: string
  desenvolupadora: string | null
  regio: string | null
  genere_principal: string | null
  generos_secundaris: string[]
  any_llancament: number | null
  sinopsi: string | null
  portada_url: string | null
  format: FormatJoc
  estat_conservacio: string | null
  estat_joc: EstatJoc
  valoracio: Valoracio | null
  favorit: boolean
  per_jugar_aviat: boolean
  canvi: boolean
  notes: string | null
  any_compra: number | null
  mes_compra: number | null
  preu: number | null
  any_jugat: number | null
  mes_jugat: number | null
  created_at: string
  updated_at: string
}

export type JocInsert = Pick<Joc, 'nom' | 'plataforma' | 'format'> & Partial<Omit<Joc, 'nom' | 'plataforma' | 'format' | 'created_at' | 'updated_at'>>
export type JocUpdate = Partial<Omit<Joc, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export type JocLlista = Pick<Joc, 'id' | 'nom' | 'plataforma'> & { portada_url?: string | null }

export type ResumJocs = {
  fisics: number
  digitals: number
  jugant: JocLlista[]
  per_jugar_aviat: JocLlista[]
}

export type EstatProposit = 'pendent' | 'descartat' | 'fet'
export type Proposit = {
  id: string
  user_id: string
  text: string
  any: number
  estat: EstatProposit
  created_at: string
  updated_at: string
}
export type PropositInput = Pick<Proposit, 'text' | 'any' | 'estat'>

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type FitxaJoc = {
  portada_fitxer?: string | null
  portada_visual_url?: string
  per_infants?: boolean
  comentaris?: string | null
  valoracio?: Valoracio | null
  id: string; user_id: string; nom: string; plataforma: string
  desenvolupadora: string | null; genere_principal: string | null; generos_secundaris: string[]
  any_llancament: number | null; sinopsi: string | null; portada_url: string | null
  portada_font_url?: string | null
  per_jugar_aviat: boolean; created_at: string; updated_at: string
}
export type Exemplar = {
  id: string; user_id: string; joc_id: string; format: 'fisic' | 'digital'
  regio: string | null; estat_conservacio: string | null; notes: string | null
  any_compra: number | null; preu: number | null; botiga_servei: string | null
  favorit: boolean; canvi: boolean; reproduccio: boolean; no_localitzat: boolean | null
  a_la_colleccio: boolean; revisat: boolean; origen: Json | null; created_at: string; updated_at: string
}
export type Experiencia = {
  id: string; user_id: string; joc_id: string; any_jugat: number | null
  completat: 'si' | 'no' | 'no_aplicable' | null; valoracio: Valoracio | null
  notes: string | null; jugant: boolean; revisat: boolean; origen: Json | null
  created_at: string; updated_at: string
}
type OwnedTable<T> = {
  Row: T
  Insert: Partial<T>
  Update: Partial<T>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      fitxes_joc: OwnedTable<FitxaJoc>
      exemplars: OwnedTable<Exemplar>
      experiencies: OwnedTable<Experiencia>
      proposits: {
        Row: Proposit
        Insert: PropositInput
        Update: Partial<PropositInput>
        Relationships: []
      }
      jocs: {
        Row: Joc
        Insert: JocInsert
        Update: JocUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      pot_editar: { Args: Record<string, never>; Returns: boolean }
      estat_restauracio: { Args: Record<string, never>; Returns: string }
      restaurar_copia: { Args: { p_copia: Json; p_actualitzar: boolean; p_estat: string }; Returns: undefined }
      resum_jocs: { Args: Record<string, never>; Returns: ResumJocs[] }
      desar_registre: {
        Args: { p_tipus: string; p_id: string; p_fitxa: Json; p_dades: Json }
        Returns: undefined
      }
      crear_registre: {
        Args: { p_tipus: string; p_joc: string | null; p_fitxa: Json; p_dades: Json }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
