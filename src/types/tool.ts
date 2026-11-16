export type Language = 'en' | 'bn';

export type ToolCategoryId =
  | 'basic'
  | 'bangladesh'
  | 'editing'
  | 'pdf'
  | 'advanced';

export interface LocalizedText {
  en: string;
  bn: string;
}

export interface ToolFaq {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  category: ToolCategoryId;
  popular: boolean;
  iconName: string;
  formatsLabel: string;
  name: LocalizedText;
  shortDesc: LocalizedText;
  description: LocalizedText;
  seoTitle: string;
  seoDescription: string;
  howToSteps: LocalizedText[];
  faqs: ToolFaq[];
  relatedIds: string[];
  supportsWorkspaceImage: boolean;
}

export interface WorkspaceImage {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  objectUrl: string;
  blob: Blob;
}
