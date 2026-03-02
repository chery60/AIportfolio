import type { CanvasElement } from '../../types';
import CaseStudyCard from './elements/CaseStudyCard';
import StickyNote from './elements/StickyNote';
import MetricCard from './elements/MetricCard';
import ProcessStep from './elements/ProcessStep';
import QuoteBlock from './elements/QuoteBlock';
import UserFlowStep from './elements/UserFlowStep';
import SectionLabel from './elements/SectionLabel';
import TagCluster from './elements/TagCluster';
import Storyboard from './elements/Storyboard';
import VideoEmbed from './elements/VideoEmbed';
import FigmaEmbed from './elements/FigmaEmbed';
import FlowDiagram from './elements/FlowDiagram';
import DataDimension from './elements/DataDimension';
import GameZone from '../Game/GameZone';

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  localColor?: string;
}

export default function CanvasElementRenderer({ element, isSelected, onSelect, localColor }: Props) {
  const onClick = () => onSelect(element.id);

  const commonProps = { isSelected, onClick };

  const renderContent = () => {
    switch (element.type) {
      case 'case-study-card':
        return <CaseStudyCard element={element} {...commonProps} />;
      case 'sticky-note':
        return <StickyNote element={element} {...commonProps} />;
      case 'metric-card':
        return <MetricCard element={element} {...commonProps} />;
      case 'process-step':
        return <ProcessStep element={element} {...commonProps} />;
      case 'quote-block':
        return <QuoteBlock element={element} {...commonProps} />;
      case 'user-flow-step':
        return <UserFlowStep element={element} {...commonProps} />;
      case 'section-label':
        return <SectionLabel element={element} {...commonProps} />;
      case 'tag-cluster':
        return <TagCluster element={element} {...commonProps} />;
      case 'storyboard':
        return <Storyboard element={element} {...commonProps} />;
      case 'video-embed':
        return <VideoEmbed element={element} {...commonProps} />;
      case 'figma-embed':
        return <FigmaEmbed element={element} {...commonProps} />;
      case 'flow-diagram':
        return <FlowDiagram element={element} {...commonProps} />;
      case 'data-dimension':
        return <DataDimension element={element} {...commonProps} />;
      case 'game-zone':
        return <GameZone element={element} {...commonProps} localColor={localColor} />;
      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div
      style={{ position: 'absolute', left: element.x, top: element.y, zIndex: element.zIndex ?? 1 }}
      onClick={e => e.stopPropagation()}
    >
      {content}
    </div>
  );
}
