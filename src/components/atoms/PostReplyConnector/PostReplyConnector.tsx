import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function PostReplyConnector() {
  return (
    <Atoms.Container overrideDefaults>
      {/* Vertical line - 35px long from post card edge to horizontal connector */}
      <Atoms.Container
        className="absolute top-[-13px] left-[-12px] h-[35px] w-px border-l border-secondary"
        overrideDefaults
      />
      {/* Horizontal connector at avatar level */}
      <Atoms.Container className="absolute top-[22px] left-[-12px]" overrideDefaults>
        <Libs.LineHorizontal />
      </Atoms.Container>
    </Atoms.Container>
  );
}
