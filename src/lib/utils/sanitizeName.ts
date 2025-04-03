export const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9_.-]/g, "_");
