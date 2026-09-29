import { describe, expect, it } from 'vitest';
import { layoutCollectionMembers } from './collectionExpandLayout';

describe('layoutCollectionMembers', () => {
  it('fans out using real sizes and walks below occupied space', () => {
    const result = layoutCollectionMembers(
      { id: 'collection', x: 100, y: 100, width: 248, height: 244 },
      [
        { id: 'a', x: 0, y: 100, width: 280, height: 180 },
        { id: 'b', x: 0, y: 100, width: 180, height: 100 },
      ],
      [{ id: 'obstacle', x: 390, y: 90, width: 300, height: 220 }],
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ nodeId: 'a', position: { x: 390, y: 352 } });
    expect(result[1]).toMatchObject({ nodeId: 'b', position: { x: 390, y: 556 } });
  });

  it('opens additional columns after the Gen1 height limit', () => {
    const members = Array.from({ length: 5 }, (_, index) => ({
      id: `n${index}`, x: 0, y: 100 + index, width: 240, height: 220,
    }));
    const result = layoutCollectionMembers(
      { id: 'collection', x: 100, y: 100, width: 248, height: 244 }, members, [],
    );
    expect(result.some((item) => item.position?.x === 660)).toBe(true);
    expect(new Set(result.map((item) => item.nodeId)).size).toBe(5);
  });
});
