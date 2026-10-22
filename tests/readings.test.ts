import test from 'node:test'
import assert from 'node:assert/strict'
import { createFeedLoader, mergeReadings, normalizeUrl, parseFeed, selectReadings, SIX_HOURS } from '../supabase/functions/_shared/readings'
const item = (title: string, path: string, categories: string[] = [], day = 1) => `<item><title><![CDATA[${title}]]></title><link>https://www.anaitgames.com/${path}/</link><pubDate>Thu, ${day.toString().padStart(2,'0')} Oct 2026 10:00:00 GMT</pubDate>${categories.map(c=>`<category><![CDATA[${c}]]></category>`).join('')}</item>`
const rss = (...items: string[]) => `<?xml version="1.0"?><rss version="2.0"><channel>${items.join('')}</channel></rss>`
test('RSS categories and path exclude podcasts, never title keywords; entities decoded', () => {
 const xml=rss(item('Podcast és al títol','valid'),...['Podcast','Recarga Activa','Podcast Reload'].map(c=>item(c,c,[c])),item('Ruta','podcast/episodi'),item('Títol &amp; llarg','article',['Artículos']))
 const entries=parseFeed(xml+'<!-- WordPress cache -->','articles')
 assert.equal(entries.length,2); assert.equal(entries[1].title,'Títol & llarg')
 assert.throws(()=>parseFeed('<rss><item></rss>','general'));assert.throws(()=>parseFeed('<!DOCTYPE rss><rss></rss>','general'))
})
test('normalization, safe links and deduplication across feeds',()=>{
 assert.equal(normalizeUrl('http://anaitgames.com/a/?utm_source=x#fragment'),'https://www.anaitgames.com/a')
 assert.throws(()=>normalizeUrl('https://example.com/a'));assert.throws(()=>normalizeUrl('javascript:alert(1)'))
 const a=parseFeed(rss(item('A','a')),'articles'),g=parseFeed(rss(item('A','a')),'general')
 assert.equal(mergeReadings([...a,...g]).length,1);assert.deepEqual(mergeReadings([...a,...g])[0].sources,['articles','general'])
})
test('latest three across every source, no category quotas; dates descending and unique',()=>{
 const entries=[...parseFeed(rss(item('Article','a',[],1)),'articles'),...parseFeed(rss(item('Anàlisi','b',[],3)),'analyses'),...parseFeed(rss(item('Notícia 1','c',['Noticias'],8),item('Notícia 2','d',['Noticias'],9),item('Notícia 3','e',['Noticias'],10)),'general')]
 assert.deepEqual(selectReadings([...entries,...entries]).map(e=>e.title),['Notícia 3','Notícia 2','Notícia 1'])
 assert.equal(selectReadings(entries.slice(0,1)).length,1);assert.deepEqual(selectReadings([]),[])
})
test('cache coalesces concurrent requests for six hours; failure uses stale cache',async()=>{
 let calls=0,clock=0,fail=false
 const fetcher=(async()=>{calls++;if(fail)throw Error('offline');return new Response(rss(item('A','a')))}) as typeof fetch
 const load=createFeedLoader(fetcher,()=>clock)
 await Promise.all([load(),load(),load()]);assert.equal(calls,3)
 await load();assert.equal(calls,3)
 clock=SIX_HOURS+1;fail=true;const data=await load();assert.equal(calls,6);assert.equal(data.stale,true)
 await load();assert.equal(calls,6)
 await assert.rejects(createFeedLoader(fetcher)())
})
test('partial failure returns only eligible successful sources and retries earlier',async()=>{
 let calls=0,clock=0
 const load=createFeedLoader((async(url)=>{calls++;if(String(url).includes('analisis'))throw Error('offline');return new Response(rss(item('A','a')))}) as typeof fetch,()=>clock)
 assert.equal((await load()).partial,true);clock=300001;await load();assert.equal(calls,6)
})
