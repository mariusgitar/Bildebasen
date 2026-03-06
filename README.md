# Image Converter (PR1)

En liten webapp for bildekonvertering som kjører **100 % i nettleseren**.
Ingen backend, ingen serveropplasting.

## Teknologi

- Vite
- React
- TypeScript
- Browser API-er: File input, drag-and-drop, Image decode, Canvas, `toBlob`

## Kom i gang lokalt

```bash
npm install
npm run dev
```

Åpne URL-en Vite skriver ut i terminalen (vanligvis `http://localhost:5173`).

## Bygg statisk

```bash
npm run build
npm run preview
```

`dist/` kan deployes som statiske filer.

## Deploy til GitHub Pages

Repoet inneholder workflow: `.github/workflows/deploy.yml`.

### Oppsett i GitHub

1. Push til `main`.
2. Gå til **Settings → Pages**.
3. Sett **Source** til **GitHub Actions**.
4. Workflowen bygger appen og deployer automatisk.

`vite.config.ts` setter riktig `base` under GitHub Actions, basert på repo-navn.

## Scope i PR1

- Last opp en eller flere filer via filvelger eller drag-and-drop
- Støttede input-format: JPG/JPEG, PNG, WEBP
- Filkort med navn, originalformat, størrelse og thumbnail
- Velg output-format: JPG, PNG eller WEBP
- Konverter og last ned filer
- Tydelige tom-, laste- og feiltilstander

Ikke inkludert i PR1: resize, kvalitetsslider, batch-zip, metadata, editor/crop, HEIC.

## Foreslått mappestruktur

```text
src/
  features/image-convert/
    components/
    lib/
    types/
```

- `components`: UI og presentasjon
- `lib`: validering, konvertering og nedlasting
- `types`: delte domene-typer

## Manuell test (desktop)

1. Start appen med `npm run dev`.
2. Last opp `.jpg`, `.png` og `.webp`.
3. Bekreft at filkort viser navn, format, størrelse og forhåndsvisning.
4. Velg output-format i dropdown.
5. Trykk **Konverter og last ned alle**.
6. Bekreft at nedlastede filer har valgt filendelse/format.
7. Last opp en ugyldig fil (f.eks. `.gif`) og bekreft feilmelding.
8. Verifiser at UI er ryddig og forståelig på desktop.
