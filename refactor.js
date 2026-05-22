const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const pagesDir = path.join(baseDir, 'src', 'pages');
const stylesDir = path.join(baseDir, 'src', 'styles');
const jsDir = path.join(baseDir, 'src', 'js');

// Create directories if they don't exist
[pagesDir, stylesDir, jsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const files = [
    'perfil_estudiante.html',
    'tutor_profile.html',
    'tutor_management_availability.html'
];

for (const filename of files) {
    const filepath = path.join(baseDir, filename);
    if (!fs.existsSync(filepath)) {
        console.log(`Skipping ${filename}, not found.`);
        continue;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    const name = filename.replace('.html', '');

    // Extract CSS
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
    let styles = [];
    let match;
    while ((match = styleRegex.exec(content)) !== null) {
        styles.push(match[1]);
    }

    if (styles.length > 0) {
        const cssContent = styles.join('\n').trim();
        fs.writeFileSync(path.join(stylesDir, `${name}.css`), cssContent, 'utf8');
        
        // Replace first style tag with link, remove the rest
        let replaced = false;
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => {
            if (!replaced) {
                replaced = true;
                return `<link rel="stylesheet" href="../styles/${name}.css" />`;
            }
            return '';
        });
    }

    // Extract JS
    const scriptRegex = /<script(?! src)[^>]*>([\s\S]*?)<\/script>/g;
    let scripts = [];
    content = content.replace(scriptRegex, (m, scriptContent) => {
        if (scriptContent.includes('tailwind.config')) {
            return m; // keep tailwind config
        }
        scripts.push(scriptContent);
        return '';
    });

    if (scripts.length > 0) {
        const jsContent = scripts.join('\n').trim();
        fs.writeFileSync(path.join(jsDir, `${name}.js`), jsContent, 'utf8');
        content = content.replace('</body>', `<script src="../js/${name}.js"></script>\n</body>`);
    }

    // Replace links
    content = content.replace(/student_learning_dashboard\.html/g, 'perfil_estudiante.html');
    content = content.replace(/tutor_platform_home_search\.html/g, 'tutor_home.html');

    if (name === 'perfil_estudiante') {
        content = content.replace(/href="#"/g, 'href="tutor_profile.html"');
        content = content.replace(/href="tutor_profile\.html">Ver Calendario<\/a>/g, 'href="tutor_management_availability.html">Ver Calendario</a>');
    }

    fs.writeFileSync(path.join(pagesDir, filename), content, 'utf8');
    fs.unlinkSync(filepath);
    console.log(`Processed ${filename}`);
}
