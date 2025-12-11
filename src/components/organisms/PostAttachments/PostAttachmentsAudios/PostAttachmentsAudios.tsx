import * as Atoms from '@/atoms';
import type { AttachmentConstructed } from '../PostAttachments.types';

type PostAttachmentsAudiosProps = {
  audios: AttachmentConstructed[];
};

export const PostAttachmentsAudios = ({ audios }: PostAttachmentsAudiosProps): React.ReactElement => {
  return (
    <Atoms.Container className="gap-3">
      {audios.map((a, i) => (
        <Atoms.Audio
          key={i}
          onClick={(e) => {
            e.stopPropagation();
          }}
          src={a.urls.main}
          className="cursor-auto"
        />
      ))}
    </Atoms.Container>
  );
};
