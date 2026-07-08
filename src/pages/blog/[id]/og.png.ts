import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';

const font = fs.readFileSync('./src/assets/og/LXGWWenKaiTC-Regular.ttf');

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as CollectionEntry<'blog'>;
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#fffdf8',
          color: '#292524',
          fontFamily: 'LXGW WenKai TC',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      backgroundColor: '#b0f3f1',
                      color: '#134e4a',
                      fontSize: '22px',
                      letterSpacing: '6px',
                      padding: '6px 22px',
                      borderRadius: '99px',
                      marginBottom: '36px',
                      alignSelf: 'flex-start',
                    },
                    children: 'BLOG',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', fontSize: '58px', lineHeight: 1.4 },
                    children: post.data.title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '18px', fontSize: '30px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            width: '40px',
                            height: '40px',
                            borderRadius: '20px',
                            backgroundImage: 'linear-gradient(135deg, #ffcfdf 0%, #b0f3f1 100%)',
                          },
                        },
                      },
                      { type: 'div', props: { style: { display: 'flex' }, children: 'Yio Chou' } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', fontSize: '26px', color: '#a8a29e' },
                    children: 'yiochou.com',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'LXGW WenKai TC', data: font, weight: 400, style: 'normal' }],
    }
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
