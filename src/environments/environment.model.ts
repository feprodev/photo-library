export interface Environment {
  readonly apiUrl: string;
  readonly imageCdnUrl: string;
  readonly apiLatencyMs: { readonly min: number; readonly max: number };
}
