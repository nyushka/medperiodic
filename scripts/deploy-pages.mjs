// Publishes dist/ to the gh-pages branch (GitHub Pages). Run with: npm run deploy
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' })
const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) throw new Error('Run npm run build first')
const dir = mkdtempSync(join(tmpdir(), 'gh-pages-'))
const remote = execSync('git remote get-url origin', { cwd: root }).toString().trim()
try {
  sh(`git clone --depth 1 --branch gh-pages ${remote} .`, dir)
} catch {
  sh('git init -b gh-pages', dir)
  sh(`git remote add origin ${remote}`, dir)
}
for (const f of readdirSync(dir)) if (f !== '.git') rmSync(join(dir, f), { recursive: true, force: true })
cpSync(dist, dir, { recursive: true })
writeFileSync(join(dir, '.nojekyll'), '')
sh('git add -A', dir)
try {
  sh('git commit -m "Deploy MedPeriodic to GitHub Pages"', dir)
} catch {
  console.log('Nothing changed.')
}
sh('git push origin gh-pages', dir)
