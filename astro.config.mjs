import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const base = '/blog';

const OPEN_RE = /^:::message([ \t]+alert)?(\n|$)/;

function openInfo(node) {
  if (node.type !== 'paragraph') return null;
  const t = node.children[0];
  if (t?.type !== 'text') return null;
  const m = OPEN_RE.exec(t.value);
  return m ? { text: t, alert: Boolean(m[1]), len: m[0].length } : null;
}

// 閉じ ::: はリスト項目の末尾などに巻き込まれるので、部分木の最後の text を見る
function lastText(node) {
  if (node.type === 'text') return node;
  const kids = node.children;
  if (!kids) return null;
  for (let k = kids.length - 1; k >= 0; k--) {
    const t = lastText(kids[k]);
    if (t) return t;
  }
  return null;
}

function closeText(node) {
  const t = lastText(node);
  if (!t) return null;
  if (t.value === ':::') return { text: t, len: 3 };
  if (t.value.endsWith('\n:::')) return { text: t, len: 4 };
  return null;
}

const notEmpty = (n) => !(n.type === 'paragraph' && n.children.every((c) => c.type === 'text' && c.value === ''));

// Zenn の :::message / :::message alert を <aside> に変換する
function remarkZennMessage() {
  return (tree) => {
    const kids = tree.children;
    for (let i = 0; i < kids.length; i++) {
      const open = openInfo(kids[i]);
      if (!open) continue;
      let j = i;
      let close = null;
      while (j < kids.length && !(close = closeText(kids[j]))) j++;
      if (!close) continue;

      close.text.value = close.text.value.slice(0, -close.len);
      open.text.value = open.text.value.slice(open.len);

      const body = kids.slice(i, j + 1).filter(notEmpty);
      kids.splice(i, j - i + 1, {
        type: 'paragraph',
        data: { hName: 'aside', hProperties: { class: open.alert ? 'msg alert' : 'msg' } },
        children: body,
      });
    }
  };
}

// 記事内の /images/... を GitHub Pages の base 配下に寄せる
function rehypeBaseImages() {
  return (tree) => {
    const walk = (n) => {
      const src = n.properties?.src;
      if (n.tagName === 'img' && typeof src === 'string' && src.startsWith('/images/')) {
        n.properties.src = base + src;
      }
      n.children?.forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://meikocho1.github.io',
  base,
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkZennMessage],
    rehypePlugins: [rehypeBaseImages],
    shikiConfig: { theme: 'github-dark' },
  },
});
