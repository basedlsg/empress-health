/**
 * Ensures the Peri+ Health Assessment link exists only under Join Us > Get Involved,
 * as the first list item (before Become a Member). Does not add top-nav, drawer,
 * or Additional Features links — see restrict-assessment-to-join-us.mjs for that policy.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const marker = "Peri+ Health Assessment"

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) {
      if (name.name === "node_modules") continue
      walk(p, out)
    } else if (name.isFile() && name.name.endsWith(".html")) out.push(p)
  }
  return out
}

function patchJoinUsAssessmentFirst(t) {
  let s = t
  s = s.replace(
    /(<h5>Get Involved<\/h5>\s*<ul class="menu-list">\s*\r?\n)(\s*)(<li><a class="menu-link" href="\/signup">Become a Member<\/a><\/li>)/g,
    (match, ulOpen, indent, become, offset, whole) => {
      const after = whole.slice(offset + match.length)
      const ulEnd = after.indexOf("</ul>")
      const innerUl = ulEnd === -1 ? after : after.slice(0, ulEnd)
      if (innerUl.includes('href="/assessment/"')) return match
      return `${ulOpen}${indent}<li><a class="menu-link" href="/assessment/">${marker}</a></li>\r\n${indent}${become}`
    }
  )
  s = s.replace(
    /(<summary>Join Us<\/summary>\s*<ul>\s*\r?\n)(\s*)(<li><a href="\/signup">Become a Member<\/a><\/li>)/g,
    (match, ulOpen, indent, become, offset, whole) => {
      const after = whole.slice(offset + match.length)
      const ulEnd = after.indexOf("</ul>")
      const innerUl = ulEnd === -1 ? after : after.slice(0, ulEnd)
      if (innerUl.includes('href="/assessment/"')) return match
      return `${ulOpen}${indent}<li><a href="/assessment/">${marker}</a></li>\r\n${indent}${become}`
    }
  )
  return s
}

const files = walk(root)
let n = 0
for (const file of files) {
  const before = fs.readFileSync(file, "utf8")
  const t = patchJoinUsAssessmentFirst(before)
  if (t !== before) {
    fs.writeFileSync(file, t, "utf8")
    n++
    console.log("updated", path.relative(root, file))
  }
}
console.log(`Done. ${n} files updated.`)
