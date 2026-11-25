import { defineConfig } from 'astro/config';

// Ajuste `site` para o domínio do projeto (usado em canonical/OG).
export default defineConfig({
  site: 'https://casanos.com.br',
  // cliente com um funil só: a raiz leva à LP de casamentos
  redirects: { '/': '/casamentos' },
  output: 'static',
  prefetch: true,
  build: {
    inlineStylesheets: 'always',
  },
  server: {
    port: 4321,
  },
});
