export interface CapacitorFirestorePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
