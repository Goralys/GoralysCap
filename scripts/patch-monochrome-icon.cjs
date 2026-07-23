// scripts/patch-monochrome-icon.cjs
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ANDROID_RES = path.join(__dirname, "..", "android", "app", "src", "main", "res");
const SOURCE_ICON = path.join(__dirname, "..", "assets", "icon-monochrome.png");

// Tailles standard des icônes adaptatives Android (108dp de base)
const DENSITIES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
};

async function generateMonochromeIcons() {
    if (!fs.existsSync(SOURCE_ICON)) {
        console.error(`[monochrome] Source file not found: ${SOURCE_ICON}`);
        process.exit(1);
    }

    for (const [dir, size] of Object.entries(DENSITIES)) {
        const targetDir = path.join(ANDROID_RES, dir);
        if (!fs.existsSync(targetDir)) {
            console.warn(`[monochrome] Skipping missing dir: ${targetDir}`);
            continue;
        }

        const targetFile = path.join(targetDir, "ic_launcher_monochrome.png");
        await sharp(SOURCE_ICON)
            .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(targetFile);

        console.log(`[monochrome] Generated ${targetFile}`);
    }
}

function patchXml(fileName) {
    const xmlDir = path.join(ANDROID_RES, "mipmap-anydpi-v26");
    const filePath = path.join(xmlDir, fileName);

    if (!fs.existsSync(filePath)) {
        console.warn(`[monochrome] XML not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, "utf-8");

    if (content.includes("<monochrome")) {
        console.log(`[monochrome] ${fileName} already patched, skipping`);
        return;
    }

    const monochromeTag =
        "    <monochrome>\n" +
        '        <inset android:drawable="@mipmap/ic_launcher_monochrome" android:inset="16.7%" />\n' +
        "    </monochrome>\n";

    content = content.replace("</adaptive-icon>", `${monochromeTag}</adaptive-icon>`);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`[monochrome] Patched ${fileName}`);
}

(async () => {
    await generateMonochromeIcons();
    patchXml("ic_launcher.xml");
    patchXml("ic_launcher_round.xml");
    console.log("[monochrome] Done.");
})();
