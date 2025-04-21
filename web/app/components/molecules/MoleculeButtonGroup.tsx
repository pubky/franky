import { FC } from 'react'
import AtomButton from '../atoms/AtomButton'

interface MoleculeButtonGroupProps {
  primaryText: string
  secondaryText: string
  onPrimaryClick: () => void
  onSecondaryClick: () => void
  className?: string
}

const MoleculeButtonGroup: FC<MoleculeButtonGroupProps> = ({
  primaryText,
  secondaryText,
  onPrimaryClick,
  onSecondaryClick,
  className = ''
}) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      <AtomButton variant="primary" onClick={onPrimaryClick}>
        {primaryText}
      </AtomButton>
      <AtomButton variant="outline" onClick={onSecondaryClick}>
        {secondaryText}
      </AtomButton>
    </div>
  )
}

export default MoleculeButtonGroup 