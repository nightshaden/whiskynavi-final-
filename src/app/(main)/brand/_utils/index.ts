export const getProductPosition = (
  currentCenter: number,
  productIndex: number,
  totalProducts: number,
) => {
  //   const currentCenter = productIndexes[brandId];
  // Calculate relative position (-2 to +2, with wrapping)
  let relativePos = productIndex - currentCenter;
  if (relativePos > totalProducts / 2) relativePos -= totalProducts;
  if (relativePos < -totalProducts / 2) relativePos += totalProducts;

  // Only show cards within range
  if (Math.abs(relativePos) > 2) return null;

  // 일정한 간격으로 카드 배치 (간격 늘림)
  const cardSpacing = 180; // 카드 간 간격
  const x = relativePos * cardSpacing;
  const y = 0; // 수평 정렬

  // z축으로 깊이감 (뒤로 갈수록 멀리)
  const z = -Math.abs(relativePos) * 150;

  // 회전 없음
  const rotateY = 0;

  // 크기는 거리에 따라 조정 (중앙이 가장 크고, 멀어질수록 작아짐)
  const distanceFromCenter = Math.abs(relativePos);
  let scale;
  if (distanceFromCenter === 0) scale = 1;
  else if (distanceFromCenter === 1) scale = 0.85;
  else scale = 0.7;

  // 밝기 계산 (relativePos 기준으로 일정하게)
  let brightness;
  if (distanceFromCenter === 0)
    brightness = 1; // 중앙: 밝음
  else if (distanceFromCenter === 1)
    brightness = 0.6; // ±1: 어두움
  else brightness = 0.4; // ±2: 더 어두움

  const opacity = 1;
  const zIndex = 30 - distanceFromCenter * 10;

  return { x, y, z, rotateY, scale, opacity, zIndex, brightness };
};
