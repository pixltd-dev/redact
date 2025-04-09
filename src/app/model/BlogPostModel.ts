export interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at?: string;
  categoryID?: number;
}
