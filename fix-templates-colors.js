const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\admin\\Desktop\\task-management\\front-task\\src\\components\\landing\\templates';

function replaceInFile(filename, replacements) {
    const filePath = path.join(dir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const [pattern, replacement] of replacements) {
        content = content.replace(pattern, replacement);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filename}`);
}

// 1. TemplatesSection.tsx
replaceInFile('TemplatesSection.tsx', [
    [/text-white md:text-3xl/g, 'text-foreground md:text-3xl'],
    [/text-white\/60 md:text-base/g, 'text-muted-foreground md:text-base'],
    [/border-white\/15 bg-black\/30 px-4 text-white hover:bg-white hover:text-black/g, 'border-border bg-background\/50 px-4 text-foreground hover:bg-secondary hover:text-foreground']
]);

// 2. TemplatesFaqSection.tsx
replaceInFile('TemplatesFaqSection.tsx', [
    [/border-white\/20 text-white bg-\[rgba\(255,255,255,0\.08\)\]/g, 'border-primary text-primary bg-primary/10'],
    [/border-white\/10 text-white bg-\[rgba\(255,255,255,0\.03\)\] hover:border-white\/20 hover:bg-\[rgba\(255,255,255,0\.05\)\]/g, 'border-border text-foreground bg-card hover:border-primary/50 hover:bg-muted'],
    [/text-white\n\t\t\t\t\t\}/g, 'text-foreground\n\t\t\t\t\t}'],
    [/text-white\/80/g, 'text-primary'],
    [/text-white\/60/g, 'text-muted-foreground'],
    [/border-t border-white\/10/g, 'border-t border-border'],
    [/text-white\/70/g, 'text-muted-foreground'],
    [/border border-white\/10 bg-black\/75 shadow-\[0_0_0_1px_rgba\(255,255,255,0\.03\)\]/g, 'border border-border bg-card shadow-sm'],
    [/border border-white\/10 bg-\[linear-gradient\(180deg,rgba\(255,255,255,0\.05\),rgba\(255,255,255,0\.03\)\)\]/g, 'border border-border bg-gradient-to-b from-muted to-background'],
    [/bg-\[radial-gradient\(circle_at_center,rgba\(255,255,255,0\.06\),transparent_58%\)\]/g, 'bg-primary/5'],
    [/text-white/g, 'text-foreground'], // This catches most text-white
    [/border-white\/20/g, 'border-border'],
    [/bg-black\/70/g, 'bg-foreground/50'],
    [/border-white\/15 bg-black px-6 text-sm font-medium text-white hover:bg-white hover:text-black/g, 'border-border bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 hover:text-background']
]);

// 3. TemplatePreview.tsx
replaceInFile('TemplatePreview.tsx', [
    [/border-white\/10 bg-white\/\[0\.04\]/g, 'border-border bg-muted'],
    [/border-white\/10 bg-\[#0d0f14\]/g, 'border-border bg-card'],
    [/bg-white\/10/g, 'bg-border'],
    [/bg-white\/5/g, 'bg-secondary'],
    [/border-white\/20/g, 'border-primary/20'],
    [/bg-white\/\[0\.05\]/g, 'bg-muted'],
    [/bg-violet-500/g, 'bg-primary'],
    [/bg-violet-400/g, 'bg-primary/80']
]);

console.log('Done!');
