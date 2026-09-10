/**
 * Contract tests: keep openapi.yaml honest.
 *
 * These walk the Express router and compare it with the spec, so a route added
 * without documentation (or a documented route that no longer exists) fails the
 * build instead of quietly rotting.
 */
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { app, closeDb } from './helpers';

const SPEC_PATH = path.join(__dirname, '..', '..', 'openapi.yaml');

interface Spec {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, Record<string, unknown>>;
  components: { schemas: Record<string, unknown> };
}

const spec: Spec = parse(fs.readFileSync(SPEC_PATH, 'utf8'));

/** `/scholarships/:id/save` -> `/scholarships/{id}/save` */
const toSpecPath = (expressPath: string): string =>
  expressPath.replace(/:([A-Za-z_]\w*)/g, '{$1}');

interface Route {
  method: string;
  path: string;
}

/**
 * Mount prefixes to probe for: every distinct first segment in the spec, plus
 * the root. A router mounted somewhere undocumented matches none of these and
 * is reported as `/<unknown-mount>`, which fails the coverage test rather than
 * silently disappearing.
 */
const MOUNT_CANDIDATES = [
  '/',
  ...new Set(
    Object.keys(spec.paths)
      .map(p => `/${p.split('/')[1] ?? ''}`)
      .filter(p => p.length > 1)
  )
];

/**
 * Express 5 replaced the inspectable `layer.regexp` with an opaque matcher
 * closure, so the mount path is recovered by calling the matcher with each
 * candidate prefix instead of parsing internals.
 */
const mountPathOf = (layer: any): string => {
  const matcher = layer.matchers?.[0];
  if (typeof matcher !== 'function') return '';

  const matched = MOUNT_CANDIDATES.filter(candidate => {
    try {
      return Boolean(matcher(candidate));
    } catch {
      return false;
    }
  });

  // '/' matches only a router mounted at the root; anything longer wins.
  const specific = matched.filter(m => m !== '/').sort((a, b) => b.length - a.length);
  if (specific.length > 0) return specific[0];
  return matched.includes('/') ? '' : '/<unknown-mount>';
};

/** Walk the router tree for every mounted method + path pair. */
const collectRoutes = (): Route[] => {
  const routes: Route[] = [];

  const visit = (stack: any[], prefix: string): void => {
    for (const layer of stack) {
      if (layer.route) {
        const routePath = prefix + (layer.route.path === '/' ? '' : layer.route.path);
        const methods = Object.keys(layer.route.methods ?? {}).filter(m => m !== '_all');
        for (const method of methods) {
          routes.push({ method, path: routePath || '/' });
        }
      } else if (layer.handle?.stack) {
        visit(layer.handle.stack, prefix + mountPathOf(layer));
      }
    }
  };

  const stack = (app as any).router?.stack ?? (app as any)._router?.stack ?? [];
  visit(stack, '');
  return routes;
};

describe('OpenAPI specification', () => {
  after(closeDb);

  it('is a valid OpenAPI 3.1 document with the required top-level fields', () => {
    assert.match(spec.openapi, /^3\.1\./);
    assert.ok(spec.info.title);
    assert.ok(spec.info.version);
    assert.ok(spec.paths && Object.keys(spec.paths).length > 0);
  });

  it('documents every route the app actually serves', () => {
    const routes = collectRoutes();
    assert.ok(routes.length > 0, 'could not read any routes off the Express app');

    const undocumented = routes.filter(({ method, path: p }) => {
      const specPath = spec.paths[toSpecPath(p)];
      return !specPath || !(method in specPath);
    });

    assert.deepEqual(
      undocumented.map(r => `${r.method.toUpperCase()} ${r.path}`),
      [],
      'these routes exist but are missing from openapi.yaml'
    );
  });

  it('does not document routes the app does not serve', () => {
    const served = new Set(
      collectRoutes().map(r => `${r.method} ${toSpecPath(r.path)}`)
    );

    const phantom: string[] = [];
    for (const [specPath, operations] of Object.entries(spec.paths)) {
      for (const method of Object.keys(operations)) {
        if (method === 'parameters') continue;
        if (!served.has(`${method} ${specPath}`)) {
          phantom.push(`${method.toUpperCase()} ${specPath}`);
        }
      }
    }

    assert.deepEqual(phantom, [], 'these operations are documented but not implemented');
  });

  it('resolves every $ref to a defined schema', () => {
    const refs: string[] = [];
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node && typeof node === 'object') {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          if (key === '$ref' && typeof value === 'string') refs.push(value);
          else walk(value);
        }
      }
    };
    walk(spec);

    const broken = refs.filter(ref => {
      const segments = ref.replace(/^#\//, '').split('/');
      let cursor: any = spec;
      for (const segment of segments) {
        cursor = cursor?.[segment];
        if (cursor === undefined) return true;
      }
      return false;
    });

    assert.deepEqual(broken, [], 'unresolvable $ref pointers');
  });

  it('documents every column the scholarships endpoint returns', async () => {
    const documented = Object.keys(
      (spec.components.schemas.Scholarship as { properties: Record<string, unknown> }).properties
    );
    // Columns come from the shared schema module, so this catches a migration
    // that adds a field without updating the spec.
    const { TABLE_NAMES } = require('../seeds/schema');
    assert.ok(TABLE_NAMES.includes('scholarships'));

    const { pool } = require('./helpers');
    const { rows } = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'scholarships' AND table_schema = current_schema()`
    );
    if (rows.length === 0) return; // schema not created in this run

    const missing = rows
      .map((r: { column_name: string }) => r.column_name)
      .filter((column: string) => !documented.includes(column));

    assert.deepEqual(missing, [], 'scholarship columns missing from the OpenAPI schema');
  });
});
