import test from 'node:test'
import assert from 'node:assert/strict'
import {genreOptions,genreKey,confirmGenre} from '../src/lib/genres'
test('genres are alphabetic, single-valued and deduplicated by case, accents and whitespace without mutating source',()=>{
 const source=['Acció','accio',' ACCIÓ ','Rol',' Puzzle  aventura ','Puzzle aventura',null]
 const before=structuredClone(source)
 const options=genreOptions(source)
 assert.equal(options.length,3);assert.equal(new Set(options.map(genreKey)).size,3)
 assert.deepEqual(options,[...options].sort((a,b)=>a.localeCompare(b,'ca')))
 assert.deepEqual(source,before)
 assert.equal(confirmGenre('  ACCIO ',['Acció','Rol']),'Acció')
 assert.equal(confirmGenre(' puzzle   aventura ',['Puzzle aventura']),'Puzzle aventura')
 assert.equal(confirmGenre('  Nou   gènere  ',options),'Nou gènere')
 assert.equal(confirmGenre('   ',options),null)
})
test('existing spelling is preserved; empty genre is not assigned and saved new genre is available later',()=>{
 assert.deepEqual(genreOptions([null,undefined,'']),[])
 assert.deepEqual(genreOptions(['Acció','accio'],'accio'),['accio'])
 assert.deepEqual(genreOptions(['Rol'],' Gènere antic '),[' Gènere antic ','Rol'])
 assert.equal(genreOptions([' '],' ')[0],' ')
 const added=confirmGenre('Estratègia',[])!
 assert(genreOptions(['Acció',added]).includes('Estratègia'))
})
