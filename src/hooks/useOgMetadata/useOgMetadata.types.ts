export interface OgMetadata {
  url: string;
  title: string | null;
  image: string | null;
  type: 'website' | 'image' | 'video' | 'audio';
}
