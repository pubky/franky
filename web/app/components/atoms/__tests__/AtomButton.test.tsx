import { render, screen, fireEvent } from '@testing-library/react'
import AtomButton from '../AtomButton'

describe('AtomButton', () => {
  it('renders button with children', () => {
    render(<AtomButton>Click me</AtomButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<AtomButton onClick={handleClick}>Click me</AtomButton>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<AtomButton variant="primary">Button</AtomButton>)
    expect(screen.getByText('Button')).toHaveClass('bg-blue-600')

    rerender(<AtomButton variant="secondary">Button</AtomButton>)
    expect(screen.getByText('Button')).toHaveClass('bg-gray-600')

    rerender(<AtomButton variant="outline">Button</AtomButton>)
    expect(screen.getByText('Button')).toHaveClass('border-2')
  })

  it('applies size styles correctly', () => {
    const { rerender } = render(<AtomButton size="small">Button</AtomButton>)
    expect(screen.getByText('Button')).toHaveClass('px-3')

    rerender(<AtomButton size="medium">Button</AtomButton>)
    expect(screen.getByText('Button')).toHaveClass('px-4')

    rerender(<AtomButton size="large">Button</AtomButton>)
    expect(screen.getByText('Button')).toHaveClass('px-6')
  })
}) 