# The Perfect Mojito

Een Nederlandse website over de authentieke Cubaanse Mojito cocktail.

## Over het Project

"The Perfect Mojito" is een informatiewebsite die alles vertelt over de klassieke Cubaanse cocktail. Van de rijke geschiedenis sinds de 16e eeuw tot het perfecte recept met de vijf essentiële ingrediënten.

## Features

- Responsief design met een warme, tropische uitstraling
- Tailwind CSS v4 met custom kleurenpalet (rum, mint, lime, coral)
- WebP afbeeldingen met srcset voor optimale prestaties
- Schema.org structured data voor SEO
- Open Graph & Twitter Card ondersteuning
- WCAG AA contrast compliance
- Lighthouse 90+ performance score

## Technologieën

- **HTML5** - Semantische markup
- **Tailwind CSS v4** - Utility-first CSS framework
- **Custom Kleurenpalet**:
  - Rum (amber) tones voor de warme basis
  - Mint groen voor de munt accenten
  - Lime voor citrus elementen
  - Coral voor warme highlights

## GitHub Actions

De website heeft een automatische CI/CD workflow (`.github/workflows/deploy.yml`):

- **Build**: Compileert Tailwind CSS en kopieert HTML naar `dist/`
- **Lighthouse**: Controleert performance en accessibility scores
- **Deploy**: Push naar GitHub Pages bij merge naar main

### Vereisten voor Deploy

1. GitHub Pages enabled in repo settings
2. Voor Lighthouse checks: [LHCI GitHub App](https://github.com/apps/lighthouse-ci) installeren

## Getting Started

### Ontwikkeling

```bash
# Start de dev server met watch mode
npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css --watch
```

### Productie Build

```bash
# Minified CSS build
npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css --minify

# Kopieer HTML naar dist
cp src/index.html dist/index.html
```

### Preview

Open `dist/index.html` in je browser (geen server nodig, relatieve paden).

## Project Structuur

```
perfectmojito/
├── src/
│   ├── index.html      # Hoofd HTML bestand
│   └── input.css       # Tailwind input met custom theming
├── dist/
│   ├── index.html      # Gebouwde HTML
│   ├── output.css      # Gecompileerde Tailwind CSS
│   ├── images/         # Originele afbeeldingen
│   └── images/webp/    # WebP versies voor performance
└── AGENTS.md           # AI agent instructies
```

## Content

### Secties

1. **Hero** - Tropische header met call-to-action
2. **Intro** - Geschiedenis in het kort
3. **Ingrediënten** - De vijf elementen
4. **De Basis** - Uitleg over rum, munt en limoen
5. **Recept** - Stap-voor-stap bereiding (6 stappen)
6. **Geschiedenis** - Van piraat tot wereldster
7. **Hemingway** - De legendarische link
8. **Cultuur** - Cubaanse sfeer
9. **Variaties** - Moderne interpretaties
10. **CTA** - Call-to-action

### Ingrediënten

- Witte Rum (Cubaans, bijv. Havana Club)
- Limoen (vers geperst + partjes)
- Rietsuiker
- Hierbabuena (Cubaanse munt)
- Spuitwater
- Ijsklontjes
- Munt top (garnering)
- Rietje

## SEO

- Schema.org Recipe & WebSite structured data
- Open Graph meta tags
- Twitter Card support
- Nederlandse taal attributen

## Accessibility

- Skip-to-content link
- ARIA labels
- Voldoende kleurcontrast (WCAG AA)
- Focus-visible styling
- Reduced motion support

## Auteur

Ronald Punt

## Licentie

© 2026 The Perfect Mojito
