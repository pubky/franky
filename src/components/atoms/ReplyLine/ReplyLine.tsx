import * as Libs from '@/libs';

interface ReplyLineProps {
  postHeight?: number;
  path?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const ReplyLine = ({
  postHeight,
  path: customPath,
  strokeColor = 'rgb(96,96,96)',
  strokeWidth = 2,
}: ReplyLineProps) => {
  const { path, tailPath, width, height } = postHeight
    ? Libs.createReplyConnectorPath(postHeight)
    : { path: customPath || '', tailPath: null, width: 48, height: 50 };

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
