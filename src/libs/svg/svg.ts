export function createReplyConnectorPath(postHeight: number, isLast: boolean = false) {
  const x = 16;
  const y = 0;
  const safePostHeight = Math.max(postHeight || 100, 100);
  const H = safePostHeight / 2;
  const W = 24;
  const R = 8;
  const gapSpacing = 16; // gap-4 = 16px

  const validH = Math.max(H, R);
  const curveStartY = validH - R;
  const path = `M ${x} ${y} v ${curveStartY} a ${R} ${R} 0 0 0 ${R} ${R} h ${W}`;

  const tailHeight = safePostHeight / 2 + R + gapSpacing;
  const vbW = x + R + W;
  const vbH = isLast ? curveStartY + R : curveStartY + tailHeight;

  return {
    path,
    tailPath: isLast ? null : `M ${x} ${curveStartY} v ${tailHeight}`,
    width: vbW,
    height: vbH,
  };
}
