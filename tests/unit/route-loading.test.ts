import { describe, expect, it } from 'vitest';

import { routeTarget } from '@/lib/route-loading';

describe('routeTarget', () => {
  it('maps the Shopify-backed pages to their skeleton', () => {
    expect(routeTarget('/comprar')).toEqual({ kind: 'shop' });
    expect(routeTarget('/comprar?cursor=abc')).toEqual({ kind: 'shop' });
    expect(routeTarget('/comprar/mercearia')).toEqual({ kind: 'collection', handle: 'mercearia' });
    expect(routeTarget('/comprar/caf%C3%A9?cursor=x')).toEqual({
      kind: 'collection',
      handle: 'café',
    });
    expect(routeTarget('/produto/cookie-de-chocolate')).toEqual({ kind: 'product' });
    expect(routeTarget('/pesquisa?q=%20mel%20')).toEqual({ kind: 'search', q: 'mel' });
  });

  it('leaves static and outside pages alone', () => {
    expect(routeTarget('/')).toBeNull();
    expect(routeTarget('/menu')).toBeNull();
    expect(routeTarget('/diario/presentes')).toBeNull();
    expect(routeTarget('/pesquisa')).toBeNull();
    expect(routeTarget('/pesquisa?q=')).toBeNull();
    expect(routeTarget('/comprar/a/b')).toBeNull();
    expect(routeTarget('https://restaurants.umai.io/pt')).toBeNull();
    expect(routeTarget('//evil.example/comprar')).toBeNull();
    expect(routeTarget('#conteudo')).toBeNull();
  });

  it('survives a malformed escape', () => {
    expect(routeTarget('/comprar/%E0')).toEqual({ kind: 'collection', handle: '%E0' });
  });
});
