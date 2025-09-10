import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageBackground } from './ImageBackground';

describe('ImageBackground', () => {
  it('renders with default props (only image)', () => {
    render(<ImageBackground image="/bg-image.jpg" data-testid="image-background" />);

    const background = screen.getByTestId('image-background');
    expect(background).toBeInTheDocument();
    expect(background).toHaveClass('fixed', 'inset-0', 'bg-cover', 'bg-center', 'bg-no-repeat', '-z-10');
    expect(background).toHaveStyle({ backgroundImage: 'url(/bg-image.jpg)' });
  });

  it('renders with both image and mobileImage', () => {
    render(<ImageBackground image="/bg-desktop.jpg" mobileImage="/bg-mobile.jpg" data-testid="image-background" />);

    // Should render two divs - one for mobile, one for desktop
    const backgrounds = screen.getAllByTestId('image-background');
    expect(backgrounds).toHaveLength(2);

    // Mobile background (first div)
    const mobileBackground = backgrounds[0];
    expect(mobileBackground).toHaveClass('lg:hidden');
    expect(mobileBackground).toHaveStyle({ backgroundImage: 'url(/bg-mobile.jpg)' });

    // Desktop background (second div)
    const desktopBackground = backgrounds[1];
    expect(desktopBackground).toHaveClass('hidden', 'lg:block');
    expect(desktopBackground).toHaveStyle({ backgroundImage: 'url(/bg-desktop.jpg)' });
  });

  it('applies custom className to both backgrounds when mobileImage is provided', () => {
    render(
      <ImageBackground
        image="/bg-desktop.jpg"
        mobileImage="/bg-mobile.jpg"
        className="custom-bg"
        data-testid="image-background"
      />,
    );

    const backgrounds = screen.getAllByTestId('image-background');
    expect(backgrounds).toHaveLength(2);

    backgrounds.forEach((background) => {
      expect(background).toHaveClass('custom-bg');
    });
  });

  it('applies custom className when only image is provided', () => {
    render(<ImageBackground image="/bg.jpg" className="custom-bg" data-testid="image-background" />);

    const background = screen.getByTestId('image-background');
    expect(background).toHaveClass('custom-bg');
  });

  it('passes through additional props to single background', () => {
    render(<ImageBackground image="/bg.jpg" id="background-id" data-testid="image-background" />);

    const background = screen.getByTestId('image-background');
    expect(background).toHaveAttribute('id', 'background-id');
  });

  it('passes through additional props to both backgrounds when mobileImage is provided', () => {
    render(
      <ImageBackground
        image="/bg-desktop.jpg"
        mobileImage="/bg-mobile.jpg"
        id="background-id"
        data-testid="image-background"
      />,
    );

    const backgrounds = screen.getAllByTestId('image-background');
    expect(backgrounds).toHaveLength(2);

    backgrounds.forEach((background) => {
      expect(background).toHaveAttribute('id', 'background-id');
    });
  });

  it('renders with different background images', () => {
    const { rerender } = render(<ImageBackground image="/bg1.jpg" data-testid="image-background" />);

    let background = screen.getByTestId('image-background');
    expect(background).toHaveStyle({ backgroundImage: 'url(/bg1.jpg)' });

    rerender(<ImageBackground image="/bg2.png" data-testid="image-background" />);
    background = screen.getByTestId('image-background');
    expect(background).toHaveStyle({ backgroundImage: 'url(/bg2.png)' });
  });

  it('switches between single and dual background mode', () => {
    const { rerender } = render(<ImageBackground image="/bg.jpg" data-testid="image-background" />);

    // Initially single background
    let background = screen.getByTestId('image-background');
    expect(background).toBeInTheDocument();

    // Add mobileImage - should now render two backgrounds
    rerender(<ImageBackground image="/bg-desktop.jpg" mobileImage="/bg-mobile.jpg" data-testid="image-background" />);

    const backgrounds = screen.getAllByTestId('image-background');
    expect(backgrounds).toHaveLength(2);

    // Remove mobileImage - should go back to single background
    rerender(<ImageBackground image="/bg.jpg" data-testid="image-background" />);
    background = screen.getByTestId('image-background');
    expect(background).toBeInTheDocument();
  });
});

describe('ImageBackground - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ImageBackground image="/bg-image.jpg" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<ImageBackground image="/default-bg.jpg" />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customContainer } = render(<ImageBackground image="/custom-bg.jpg" className="custom-bg" />);
    expect(customContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different image types', () => {
    const { container: jpgContainer } = render(<ImageBackground image="/background.jpg" />);
    expect(jpgContainer.firstChild).toMatchSnapshot();

    const { container: pngContainer } = render(<ImageBackground image="/background.png" />);
    expect(pngContainer.firstChild).toMatchSnapshot();

    const { container: svgContainer } = render(<ImageBackground image="/background.svg" />);
    expect(svgContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for additional props', () => {
    const { container: withIdContainer } = render(<ImageBackground image="/bg.jpg" id="background-id" />);
    expect(withIdContainer.firstChild).toMatchSnapshot();

    const { container: withDataTestIdContainer } = render(<ImageBackground image="/bg.jpg" data-testid="custom-bg" />);
    expect(withDataTestIdContainer.firstChild).toMatchSnapshot();
  });
});
