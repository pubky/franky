import * as Libs from '@/libs';

export function PostReplyConnector() {
  return (
    <div>
      {/* Vertical line - 35px long from post card edge to horizontal connector */}
      <div className="absolute left-[-12px] top-[-13px] h-[35px] w-px border-l border-secondary" />
      {/* Horizontal connector at avatar level */}
      <div className="absolute left-[-12px] top-[22px]">
        <Libs.LineHorizontal className="fill-secondary" />
      </div>
    </div>
  );
}
