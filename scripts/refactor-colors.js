const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');

// Colors to look for (Tailwind neutral palette and hardcoded hex)
const colorRegex = /(?:bg|text|border|ring)-(?:neutral|zinc)-\d{2,3}(?:\/\d+)?|bg-\[#[a-fA-F0-9]{6}\]/g;

// Context-aware replacement mappings
function safeMapColor(match, fileContent, index) {
  const surroundingContext = fileContent.substring(Math.max(0, index - 80), index + 80);
  
  const isPopoverOrDialog = /PopoverContent|DialogContent|DropdownMenuContent|SelectContent|CommandList|CommandDialog/i.test(surroundingContext);
  const isCard = /Card\b|CardContent|CardHeader/i.test(surroundingContext);
  const isHover = surroundingContext.substring(0, 80).includes('hover:');
  const isFocus = surroundingContext.substring(0, 80).includes('focus:');
  
  // Exclude some cases that need manual review like bg-neutral-500/10 (might be for status badges)
  if (match.includes('-500/') || match.includes('-400/') || match.includes('-600') || match.includes('-300')) {
    return match;
  }

  const isDarkBackground = match.match(/^bg-\[#(0b0b0b|101010|111111|171717|202020|0f0f0f|252525|262626|2a2a2a|1c1c1c|1b1b1b|1f1f1f|1d1d1d|191919|242424|1b1b1d|18181b|242528|303134|3a3b3f)\]$/) || match.match(/^bg-(neutral|zinc)-(950|900)$/);

  if (isDarkBackground) {
    if (isPopoverOrDialog) return 'bg-popover';
    if (isCard) return 'bg-card';
    if (isHover) return 'hover:bg-accent';
    if (isFocus) return 'focus:bg-accent';
    return 'bg-background';
  }

  if (match.startsWith('bg-neutral-800') || match.startsWith('bg-neutral-700') || match.startsWith('bg-zinc-800') || match.startsWith('bg-zinc-700')) {
    if (isHover) return 'hover:bg-accent hover:text-accent-foreground';
    if (isFocus) return 'focus:bg-accent focus:text-accent-foreground';
    return 'bg-muted';
  }

  if (match.startsWith('bg-neutral-900/') || match.startsWith('bg-neutral-950/') || match.startsWith('bg-zinc-900/') || match.startsWith('bg-zinc-950/')) {
    if (isHover) return 'hover:bg-muted/80';
    return 'bg-muted/50';
  }

  // Borders
  if (match.match(/^border-(neutral|zinc)-(800|700|900|950)/)) {
    if (match.includes('/')) return 'border-border/50';
    return 'border-border';
  }

  // Text
  if (match.match(/^text-(neutral|zinc)-(500|400)/)) {
    if (isHover) return 'hover:text-muted-foreground';
    return 'text-muted-foreground';
  }
  if (match.match(/^text-(neutral|zinc)-(300|200|100|50)/) || match === 'text-white') {
    if (isHover) return 'hover:text-foreground';
    return 'text-foreground';
  }

  // Fallback
  return match;
}

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (file === 'admin') return; // Skip admin directory
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

function run() {
  const mode = process.argv[2] || '--inventory';
  console.log(`Running in ${mode} mode...`);

  const files = getAllFiles(COMPONENTS_DIR);
  let totalMatches = 0;
  let inventory = {};

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    let newContent = content;
    
    let matches = [...content.matchAll(colorRegex)];
    if (matches.length > 0) {
      if (mode === '--inventory') {
        matches.forEach(m => {
          inventory[m[0]] = (inventory[m[0]] || 0) + 1;
          totalMatches++;
        });
      } else {
        // Reverse loop to avoid index shifting during replacement
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i][0];
          const index = matches[i].index;
          const replacement = safeMapColor(match, content, index);
          
          if (replacement !== match) {
            newContent = newContent.substring(0, index) + replacement + newContent.substring(index + match.length);
            hasChanges = true;
            if (mode === '--dry-run') {
              console.log(`[DRY-RUN] ${path.relative(COMPONENTS_DIR, file)}: ${match} -> ${replacement}`);
            }
          }
        }

        if (mode === '--write' && hasChanges) {
          fs.writeFileSync(file, newContent, 'utf8');
          console.log(`[WRITE] Updated ${path.relative(COMPONENTS_DIR, file)}`);
        }
      }
    }
  });

  if (mode === '--inventory') {
    console.log(`Found ${totalMatches} instances of hardcoded colors.`);
    console.log(Object.entries(inventory).sort((a,b) => b[1] - a[1]).map(([k,v]) => `${k}: ${v}`).join('\n'));
  }
}

run();
