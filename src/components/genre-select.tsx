import {useEffect, useId, useRef, useState} from 'react'
import {Button} from '@/components/ui/button'
import {confirmGenre,genreOptions} from '@/lib/genres'
const control='mt-1 w-full rounded-lg border bg-card p-2 text-sm'
export function GenreSelect({genres,value,defaultValue='',onChange,canAdd}: {
  genres: (string | null | undefined)[]; value?: string; defaultValue?: string; onChange?: (value: string)=>void; canAdd: boolean
}) {
  const id=useId()
  const [local,setLocal]=useState(defaultValue)
  const [extra,setExtra]=useState<string[]>([])
  const [adding,setAdding]=useState(false)
  const [text,setText]=useState('')
  const [error,setError]=useState('')
  const input=useRef<HTMLInputElement>(null)
  const select=useRef<HTMLSelectElement>(null)
  const current=value ?? local
  const options=genreOptions([...genres,...extra],current)
  let addValue=`${id}:add`
  while(options.includes(addValue))addValue+='-'
  useEffect(()=>{
    if(adding) {
      input.current?.setCustomValidity('Confirma o cancel·la el gènere nou abans de desar.')
      input.current?.focus()
    }
  },[adding])
  function choose(next: string) {setLocal(next);onChange?.(next)}
  function cancel() {setAdding(false);setText('');setError('');select.current?.focus()}
  function confirm() {
    if(!canAdd)return
    const next=confirmGenre(text,options)
    if(next===null){setError('Escriu un gènere.');input.current?.focus();return}
    if(!options.includes(next))setExtra(previous=>[...previous,next])
    choose(next);cancel()
  }
  return <div className="min-w-0">
    <label htmlFor={id} className="block text-sm">Gènere</label>
    <select ref={select} id={id} name="genere_principal" value={current} onChange={event=>{
      if(event.target.value===addValue){setAdding(true);setText('');setError('')}
      else {choose(event.target.value);setAdding(false);setText('');setError('')}
    }} className={control}>
      <option value="">Sense gènere</option>
      {options.map(option=><option key={option} value={option}>{option.trim() || 'Sense gènere (valor existent)'}</option>)}
      {canAdd && <option value={addValue}>Afegeix un gènere…</option>}
    </select>
    {adding && canAdd && <div className="mt-3 space-y-2 rounded-lg border p-3">
      <label htmlFor={`${id}-new`} className="block text-sm">Gènere nou</label>
      <input ref={input} id={`${id}-new`} value={text} onChange={event=>{setText(event.target.value);setError('')}} autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={control} onKeyDown={event=>{
        if(event.key==='Enter'){event.preventDefault();confirm()}
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();cancel()}
      }}/>
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-2"><Button type="button" size="sm" onClick={confirm}>Confirma el gènere</Button><Button type="button" variant="outline" size="sm" onClick={cancel}>Cancel·la</Button></div>
    </div>}
  </div>
}
