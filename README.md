# Home Assistant Cards

Custom Lovelace cards built with TypeScript, Lit, and Vite.

## Included cards

- **Network card** (`network-card`):
  - Renders the home assistant network and connected devices as an interactive force-directed graph.
- **Navigation bar** (`nav-bar-card`):
  - Renders a fixed bottom navigation bar from the user's home assistant sidebar panels, plus settings or profile.

The repository also includes a small standalone preview in `index.html`. The preview uses mock home assistant data from `src/main.ts`, so it can be developed without a running home assistant instance.

## Development

Install dependencies and start the vite development server:

```sh
npm install
npm run dev
```

Vite will print the local preview URL, usually `http://localhost:5173`.
