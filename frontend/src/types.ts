// Типы данных для видео и форматов

export interface Format {
  format_id: string;
  format_note?: string;
  ext: string;
  resolution?: string;
  filesize?: number | null;
  filesizeApprox?: string | number;
  filesizeHuman?: string; // Human-readable file size
  vcodec?: string;
  acodec?: string;
  url: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  formats: Format[];
  webpage_url: string;
  description?: string;
  uploader?: string;
  view_count?: number | null;
}