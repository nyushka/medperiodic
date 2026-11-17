// Inlines the built JS and CSS into dist/index.html, producing one self-contained file: dist/corpus-atlas.html
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname
let html = readFileSync(join(dist, 'index.html'), 'utf8')
html = html.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+)"><\/script>/, (_, f) => `<script type="module">${readFileSync(join(dist, f), 'utf8').replace(/<\/script/g, '<\\/script')}</script>`)
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+)">/, (_, f) => `<style>${readFileSync(join(dist, f), 'utf8')}</style>`)
writeFileSync(join(dist, 'corpus-atlas.html'), html)
console.log('Wrote dist/corpus-atlas.html', (html.length / 1024).toFixed(0), 'KB')
