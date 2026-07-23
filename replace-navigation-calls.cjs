/**
 * Ajoute `prefetch={false}` à toutes les balises <Link ...> qui n'ont pas
 * déjà de prop `prefetch`, dans tous les fichiers .ts/.tsx d'un dossier.
 *
 * Usage :
 *   node add-prefetch-false.cjs [dossier_racine]
 *   (par défaut, dossier_racine = "src")
 *
 * Gère :
 *   <Link href="/foo">              -> <Link href="/foo" prefetch={false}>
 *   <Link href="/foo" className="x"> -> <Link href="/foo" className="x" prefetch={false}>
 *   <Link href="/foo" />             -> <Link href="/foo" prefetch={false} />
 *
 * Ignore les balises qui ont déjà un attribut `prefetch` (quelle que soit sa valeur).
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] || "src";
const EXTENSIONS = [".ts", ".tsx"];
const IGNORE_DIRS = new Set(["node_modules", ".next", "out", "android", "ios", ".git"]);

const touchedFiles = [];

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!IGNORE_DIRS.has(entry.name)) {
                walk(path.join(dir, entry.name));
            }
            continue;
        }
        if (EXTENSIONS.includes(path.extname(entry.name))) {
            processFile(path.join(dir, entry.name));
        }
    }
}

/**
 * Repère chaque balise <Link ...> (ouvrante, potentiellement auto-fermante)
 * et lui ajoute prefetch={false} si absent.
 */
function processFile(filePath) {
    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;

    // Capture <Link ...attrs...> ou <Link ...attrs.../>
    // Non-greedy jusqu'au premier > qui ferme la balise (gère les attributs
    // avec accolades JSX simples, mais pas les > littéraux dans une expression JSX imbriquée)
    content = content.replace(/<Link\b([^>]*?)(\/?)>/g, (match, attrs, selfClosingSlash) => {
        if (/\bprefetch\s*=/.test(attrs)) {
            // déjà présent, on ne touche pas
            return match;
        }

        const trimmedAttrs = attrs.replace(/\s+$/, "");
        const newAttrs = `${trimmedAttrs} prefetch={false}`;

        return `<Link${newAttrs}${selfClosingSlash ? " " : ""}${selfClosingSlash}>`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, "utf-8");
        touchedFiles.push(filePath);
    }
}

walk(ROOT);

console.log(`\n${touchedFiles.length} fichier(s) modifié(s) :\n`);
touchedFiles.forEach((f) => console.log(`  - ${f}`));
console.log("\nVérifie le diff avant de commit, surtout les <Link> avec des attributs JSX complexes.\n");
