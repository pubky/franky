import { render, screen, fireEvent } from '@testing-library/react'
import MoleculeButtonGroup from '../MoleculeButtonGroup'

describe('MoleculeButtonGroup', () => {
  const defaultProps = {
    primaryText: 'Save',
    secondaryText: 'Cancel',
    onPrimaryClick: jest.fn(),
    onSecondaryClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders both buttons with correct text', () => {
    render(<MoleculeButtonGroup {...defaultProps} />)
    
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('applies correct variants to buttons', () => {
    render(<MoleculeButtonGroup {...defaultProps} />)
    
    const primaryButton = screen.getByText('Save')
    const secondaryButton = screen.getByText('Cancel')

    expect(primaryButton).toHaveClass('bg-blue-600') // primary variant
    expect(secondaryButton).toHaveClass('border-2') // outline variant
  })

  it('calls correct handlers when buttons are clicked', () => {
    render(<MoleculeButtonGroup {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Save'))
    expect(defaultProps.onPrimaryClick).toHaveBeenCalledTimes(1)
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onSecondaryClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className to container', () => {
    const customClass = 'my-custom-class'
    render(<MoleculeButtonGroup {...defaultProps} className={customClass} />)
    
    const container = screen.getByText('Save').parentElement
    expect(container).toHaveClass(customClass)
  })

  it('maintains gap between buttons', () => {
    render(<MoleculeButtonGroup {...defaultProps} />)
    
    const container = screen.getByText('Save').parentElement
    expect(container).toHaveClass('gap-3')
  })
}) 