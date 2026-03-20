import type { GameZoneElement } from '../types';
import MobileGameZone from './Game/MobileGameZone';

const DEFAULT_GAME_ELEMENT: GameZoneElement = {
  id: 'dock-game',
  type: 'game-zone',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  data: {
    title: 'Crewmate Dash',
    accentColor: '#7C5CFC',
    contactEmail: undefined,
    contactLinkedIn: undefined,
  },
};

export default function MobileGameTab() {
  return (
    <div className="h-full overflow-y-scroll bg-[#0A0B0F] min-h-0 mobile-smooth-scroll">
      <div className="px-5 pt-14" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        <MobileGameZone element={DEFAULT_GAME_ELEMENT} />
      </div>
    </div>
  );
}
