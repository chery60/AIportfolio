export type CanvasElementType =
  | 'case-study-card'
  | 'sticky-note'
  | 'image-frame'
  | 'text-block'
  | 'user-flow-step'
  | 'connector'
  | 'metric-card'
  | 'process-step'
  | 'quote-block'
  | 'prototype-embed'
  | 'section-label'
  | 'tag-cluster'
  | 'storyboard';

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface BaseCanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface CaseStudyCardElement extends BaseCanvasElement {
  type: 'case-study-card';
  data: {
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    accentColor: string;
    metrics?: { label: string; value: string }[];
    imageUrl?: string;
  };
}

export interface StickyNoteElement extends BaseCanvasElement {
  type: 'sticky-note';
  data: {
    content: string;
    color: 'yellow' | 'purple' | 'pink' | 'cyan' | 'green';
    rotation?: number;
  };
}

export interface ImageFrameElement extends BaseCanvasElement {
  type: 'image-frame';
  data: {
    label: string;
    imageUrl: string;
    caption?: string;
    style?: 'phone' | 'desktop' | 'tablet' | 'plain';
  };
}

export interface TextBlockElement extends BaseCanvasElement {
  type: 'text-block';
  data: {
    content: string;
    variant: 'heading' | 'body' | 'caption' | 'quote';
    align?: 'left' | 'center' | 'right';
  };
}

export interface UserFlowStepElement extends BaseCanvasElement {
  type: 'user-flow-step';
  data: {
    label: string;
    description?: string;
    shape: 'rectangle' | 'diamond' | 'circle' | 'parallelogram';
    color: string;
    stepNumber?: number;
  };
}

export interface ConnectorElement extends BaseCanvasElement {
  type: 'connector';
  data: {
    fromId: string;
    toId: string;
    label?: string;
    style: 'solid' | 'dashed' | 'dotted';
    color?: string;
  };
}

export interface MetricCardElement extends BaseCanvasElement {
  type: 'metric-card';
  data: {
    label: string;
    value: string;
    change?: string;
    changePositive?: boolean;
    icon?: string;
    accentColor: string;
  };
}

export interface ProcessStepElement extends BaseCanvasElement {
  type: 'process-step';
  data: {
    stepNumber: number;
    title: string;
    description: string;
    icon?: string;
    color: string;
  };
}

export interface QuoteBlockElement extends BaseCanvasElement {
  type: 'quote-block';
  data: {
    quote: string;
    author: string;
    role?: string;
    accentColor?: string;
  };
}

export interface SectionLabelElement extends BaseCanvasElement {
  type: 'section-label';
  data: {
    title: string;
    color: string;
  };
}

export interface TagClusterElement extends BaseCanvasElement {
  type: 'tag-cluster';
  data: {
    title: string;
    tags: { label: string; color: string }[];
  };
}

export interface PrototypeEmbedElement extends BaseCanvasElement {
  type: 'prototype-embed';
  data: {
    title: string;
    description: string;
    thumbnailColor: string;
    link?: string;
  };
}

export interface StoryboardElement extends BaseCanvasElement {
  type: 'storyboard';
  data: {
    boardType: 'problem' | 'solution';
    dialogues: {
      characterName: string;
      text: string;
      color: string;
    }[];
  };
}

export type CanvasElement =
  | CaseStudyCardElement
  | StickyNoteElement
  | ImageFrameElement
  | TextBlockElement
  | UserFlowStepElement
  | ConnectorElement
  | MetricCardElement
  | ProcessStepElement
  | QuoteBlockElement
  | SectionLabelElement
  | TagClusterElement
  | PrototypeEmbedElement
  | StoryboardElement;

export interface ProjectAsset {
  id: string;
  label: string;
  thumbnailColor: string;
  type: 'image' | 'component' | 'illustration';
}

export interface ProjectFile {
  id: string;
  label: string;
  type: 'figma' | 'doc' | 'link' | 'pdf';
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
  tags: string[];
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  canvasElements: CanvasElement[];
  assets: ProjectAsset[];
  files: ProjectFile[];
  canvasSize: { width: number; height: number };
  defaultView: CanvasTransform;
}

export interface Viewer {
  id: string;
  name: string;
  color: string;
  initials: string;
  isActive: boolean;
  location?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorColor: string;
  authorInitials: string;
  content: string;
  timestamp: string;
  elementId?: string;
  reactions: { emoji: string; count: number }[];
}

export interface SelectedElement {
  element: CanvasElement | null;
  projectId: string | null;
}
