/**
 * One-time migration: Assessment only under Join Us (first item).
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const MARKER = "Peri+ Health Assessment"
const ASSESS_LI_DESKTOP = `                <li><a class="menu-link" href="/assessment/">${MARKER}</a></li>`
const ASSESS_LI_MOBILE = `        <li><a href="/assessment/">${MARKER}</a></li>`

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

function patchJoinUsDesktop(s) {
  return s.replace(
    /(<li><a class="menu-link" href="\/signup">Become a Member<\/a><\/li>)(\s*\r?\n\s*)(<li><a class="menu-link" href="\/assessment\/">Peri\+ Health Assessment<\/a><\/li>)(\s*\r?\n\s*)(<li><a class="menu-link" href="[^"]+">Contact Us<\/a><\/li>)/g,
    (_m, become, ws1, assess, ws2, contact) => `${assess}${ws1}${become}${ws2}${contact}`
  )
}

function patchJoinUsMobile(s) {
  return s.replace(
    /(<li><a href="\/signup">Become a Member<\/a><\/li>)(\s*\r?\n\s*)(<li><a href="\/assessment\/">Peri\+ Health Assessment<\/a><\/li>)(\s*\r?\n\s*)(<li><a href="[^"]+">Contact Us<\/a><\/li>)/g,
    (_m, become, ws1, assess, ws2, contact) => `${assess}${ws1}${become}${ws2}${contact}`
  )
}

/**
 * Desktop "Get Involved" has Become a Member but no /assessment/ in that ul (e.g. supplements.html).
 */
function insertAssessmentFirstInGetInvolved(s) {
  return s.replace(
    /(<h5>Get Involved<\/h5>\s*<ul class="menu-list">\s*\r?\n)(\s*)(<li><a class="menu-link" href="\/signup">Become a Member<\/a><\/li>)/g,
    (match, ulOpen, indent, become, offset, whole) => {
      const after = whole.slice(offset + match.length)
      const ulEnd = after.indexOf("</ul>")
      const innerUl = ulEnd === -1 ? after : after.slice(0, ulEnd)
      if (innerUl.includes('href="/assessment/"')) return match
      return `${ulOpen}${indent}${ASSESS_LI_DESKTOP}\r\n${indent}${become}`
    }
  )
}

function processFile(filePath) {
  let s = fs.readFileSync(filePath, "utf8")
  const before = s

  s = s.replace(
    /\r?\n(\s*)<a class="menu-trigger" href="\/assessment\/">Peri\+ Assessment<\/a>/g,
    ""
  )
  s = s.replace(
    /\r?\n(\s*)<a href="\/assessment\/" class="home-link">Peri\+ Assessment<\/a>/g,
    ""
  )
  s = s.replace(
    /(<h5>Additional Features<\/h5>\s*<ul class="menu-list">\s*)<li><a class="menu-link" href="\/assessment\/">Peri\+ Health Assessment<\/a><\/li>\s*/g,
    "$1"
  )
  s = s.replace(
    /(<summary>Additional Features[^<]*<\/summary>\s*<ul>\s*)<li><a href="\/assessment\/">Peri\+ Health Assessment<\/a><\/li>\s*/g,
    "$1"
  )

  s = patchJoinUsDesktop(s)
  s = patchJoinUsMobile(s)
  s = insertAssessmentFirstInGetInvolved(s)

  if (s !== before) {
    fs.writeFileSync(filePath, s, "utf8")
    return true
  }
  return false
}

const files = walk(root)
let n = 0
for (const file of files) {
  if (processFile(file)) {
    console.log("updated", path.relative(root, file))
    n++
  }
}
console.log(`Done. ${n} files updated.`)
