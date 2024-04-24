import { Position } from "geojson";

/**
 * The center of a polygon is to calculate the total X and Y point, divided by the number of rings
 *
 * @export
 * @param {Position[][][]} multiPolygonCoordinates
 * @returns {[number, number]}
 */
export function calculateMultiPolygonCenter(
  multiPolygonCoordinates: Position[][][]
): [number, number] {
  let totalX: number = 0;
  let totalY: number = 0;

  multiPolygonCoordinates.forEach((row: Position[][]) => {
    row.forEach((ring: Position[]) => {
      ring.forEach((point: Position) => {
        const p = point as number[];
        totalX += p[0];
        totalY += p[1];
      });
    });
  });

  const centerX =
    totalX / calculateMultiPolygonNumberOfRing(multiPolygonCoordinates);
  const centerY =
    totalY / calculateMultiPolygonNumberOfRing(multiPolygonCoordinates);
  return [centerX, centerY];
}

/**
 * Calculate the count of ring
 *
 * @param {Position[][][]} multiPolygonCoordinates
 * @returns {number}
 */
function calculateMultiPolygonNumberOfRing(
  multiPolygonCoordinates: Position[][][]
): number {
  let count: number = 0;

  multiPolygonCoordinates.forEach((row: Position[][]) => {
    row.forEach((ring: Position[]) => {
      count += ring.length;
    });
  });
  return count;
}
