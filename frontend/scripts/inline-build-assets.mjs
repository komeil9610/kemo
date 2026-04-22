import fs from 'node:fs/promises';
import path from 'node:path';

const buildDir = path.resolve(process.cwd(), 'build');
const indexPath = path.join(buildDir, 'index.html');
const faviconPath = path.join(buildDir, 'favicon.svg');
const staticCssDir = path.join(buildDir, 'static', 'css');
const staticJsDir = path.join(buildDir, 'static', 'js');

const fileExists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const readFiles = async (dirPath, filterFn = () => true) => {
  if (!(await fileExists(dirPath))) {
    return [];
  }

  const names = await fs.readdir(dirPath);
  return names.filter(filterFn).sort();
};

const escapeInlineScript = (source) => source.replace(/<\/script/gi, '<\\/script');
const svgToDataUri = (source) =>
  `data:image/svg+xml,${encodeURIComponent(source.replace(/\s+/g, ' ').trim())}`;

const buildInlineCssTags = async () => {
  const cssFiles = await readFiles(staticCssDir, (name) => name.endsWith('.css'));
  const tags = await Promise.all(
    cssFiles.map(async (fileName) => {
      const filePath = path.join(staticCssDir, fileName);
      const contents = await fs.readFile(filePath, 'utf8');
      return `<style data-inline-asset="${fileName}">${contents}</style>`;
    })
  );
  return tags.join('');
};

const buildInlineJsTags = async () => {
  const jsFiles = await readFiles(
    staticJsDir,
    (name) => name.endsWith('.js') && !name.endsWith('.LICENSE.txt')
  );
  const orderedFiles = [
    ...jsFiles.filter((name) => !name.startsWith('main.')),
    ...jsFiles.filter((name) => name.startsWith('main.')),
  ];
  const tags = await Promise.all(
    orderedFiles.map(async (fileName) => {
      const filePath = path.join(staticJsDir, fileName);
      const contents = escapeInlineScript(await fs.readFile(filePath, 'utf8'));
      return `<script data-inline-asset="${fileName}">${contents}</script>`;
    })
  );
  return tags.join('');
};

const main = async () => {
  let html = await fs.readFile(indexPath, 'utf8');
  const inlineCss = await buildInlineCssTags();
  const inlineJs = await buildInlineJsTags();
  const faviconSvg = await fs.readFile(faviconPath, 'utf8');
  const faviconDataUri = svgToDataUri(faviconSvg);

  html = html.replace(
    /<script[^>]+src="(?:\.\/|\/)?static\/js\/[^"]+"[^>]*><\/script>/g,
    ''
  );
  html = html.replace(
    /<link[^>]+href="(?:\.\/|\/)?static\/css\/[^"]+"[^>]*>/g,
    ''
  );
  html = html.replace(/<link[^>]+rel="manifest"[^>]*>/g, '');
  html = html.replace(/href="\.\/*favicon\.svg"/g, `href="${faviconDataUri}"`);

  html = html.replace('</head>', () => `${inlineCss}</head>`);
  html = html.replace('</body>', () => `${inlineJs}</body>`);

  await fs.writeFile(indexPath, html);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
