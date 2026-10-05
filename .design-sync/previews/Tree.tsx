import type * as React from 'react';
import { Tree, TreeItem, TreeItemLabel } from 'tanstack-dashboard-ui';

// `Tree` is a presentation layer over a headless tree instance: `TreeItem`
// reads its level, folder/expanded/selected state and name off the item object
// the caller passes in. These previews build those item objects from a plain
// nested list so the composition can be shown without wiring a data loader.
type Node = {
  id: string;
  name: string;
  level: number;
  folder?: boolean;
  expanded?: boolean;
  selected?: boolean;
};

function itemFor(node: Node) {
  return {
    getId: () => node.id,
    getProps: () => ({ type: 'button' as const }),
    getItemMeta: () => ({ level: node.level }),
    getItemName: () => node.name,
    isFolder: () => node.folder === true,
    isExpanded: () => node.expanded === true,
    isSelected: () => node.selected === true,
    isFocused: () => false,
    isDragTarget: () => false,
    isMatchingSearch: () => false
  };
}

/** What `TreeItem` really wants — a headless-tree `ItemInstance`. */
type TreeItemInstance = React.ComponentProps<typeof TreeItem>['item'];

function renderNodes(nodes: Node[]) {
  return nodes.map((node) => (
    // The stand-in implements every method TreeItem calls, but not the rest of
    // the ItemInstance surface, so the cast goes through `unknown`.
    <TreeItem key={node.id} item={itemFor(node) as unknown as TreeItemInstance}>
      <TreeItemLabel />
    </TreeItem>
  ));
}

const rooms: Node[] = [
  {
    id: 'hamburg',
    name: 'Seehotel Hamburg',
    level: 0,
    folder: true,
    expanded: true
  },
  { id: 'f2', name: 'Second floor', level: 1, folder: true, expanded: true },
  { id: 'r201', name: '201 · Standard twin', level: 2 },
  {
    id: 'r214',
    name: '214 · Deluxe double, sea view',
    level: 2,
    selected: true
  },
  { id: 'r218', name: '218 · Standard double', level: 2 },
  { id: 'f3', name: 'Third floor', level: 1, folder: true, expanded: true },
  { id: 'r302', name: '302 · Junior suite', level: 2 },
  { id: 'r309', name: '309 · Accessible double', level: 2 },
  { id: 'f4', name: 'Fourth floor', level: 1, folder: true },
  { id: 'sylt', name: 'Kurhaus Sylt', level: 0, folder: true }
];

const categories: Node[] = [
  { id: 'minibar', name: 'Minibar', level: 0, folder: true, expanded: true },
  { id: 'soft', name: 'Soft drinks', level: 1 },
  { id: 'wine', name: 'Wine & sparkling', level: 1 },
  { id: 'snacks', name: 'Snacks', level: 1, folder: true },
  { id: 'spa', name: 'Spa & wellness', level: 0, folder: true, expanded: true },
  { id: 'massage', name: 'Massages', level: 1, selected: true },
  { id: 'sauna', name: 'Sauna passes', level: 1 },
  { id: 'transfer', name: 'Airport transfer', level: 0 }
];

export function RoomsByFloor() {
  return (
    <Tree indent={16} style={{ width: 340 }}>
      {renderNodes(rooms)}
    </Tree>
  );
}

export function PlusMinusToggle() {
  return (
    <Tree indent={16} toggleIconType="plus-minus" style={{ width: 340 }}>
      {renderNodes(categories)}
    </Tree>
  );
}

export function WideIndent() {
  return (
    <Tree indent={32} style={{ width: 340 }}>
      {renderNodes(rooms.slice(0, 5))}
    </Tree>
  );
}
