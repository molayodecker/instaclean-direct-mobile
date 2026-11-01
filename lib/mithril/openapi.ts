import type { operations } from './generated/mithril';

export type { components, operations, paths } from './generated/mithril';

type JsonBody<R> = R extends { content: { 'application/json': infer B } } ? B : never;

/** 200 JSON body for a Mithril OpenAPI operation. */
export type MithrilOpSuccess<Op extends keyof operations> = JsonBody<
  operations[Op]['responses'][200 & keyof operations[Op]['responses']]
>;

export type MithrilOpQuery<Op extends keyof operations> = NonNullable<
  operations[Op]['parameters']['query']
>;

export type MithrilOpPath<Op extends keyof operations> = NonNullable<
  operations[Op]['parameters']['path']
>;

export type MithrilOpBody<Op extends keyof operations> = NonNullable<
  operations[Op]['requestBody']
> extends {
  content: { 'application/json': infer B };
}
  ? B
  : never;

export function mithrilQueryString(
  query?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}
