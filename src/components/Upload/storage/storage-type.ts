export type Storage = {
  upload: (file: File, action: string, hashId?: string) => Promise<any>;
};
