interface ReplyLineProps {
  width?: number;
  height?: number;
  path: string;
  tailPath?: string | null;
  strokeColor?: string;
  strokeWidth?: number;
}

export const ReplyLine = ({
  width = 48,
  height = 50,
  path,
  tailPath,
  strokeColor = 'rgb(96,96,96)',
  strokeWidth = 2,
}: ReplyLineProps) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMin meet">
      <path d={path} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      {tailPath && (
        <path
          d={tailPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
};
