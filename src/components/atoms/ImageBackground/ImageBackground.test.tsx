import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageBackground } from './ImageBackground';

describe('ImageBackground', () => {
  it('renders with default props', () => {
    render(<ImageBackground image="/bg-image.jpg" />);
    const imageBackground = screen.getByTestId('image-background');
    expect(imageBackground).toBeInTheDocument();
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

  it('matches snapshots for image and mobileImages props', () => {
    const { container: withImageContainer } = render(<ImageBackground image="/bg.jpg" mobileImage="/bg-mobile.jpg" className="custom-bg"  />);
    expect(withImageContainer.firstChild).toMatchSnapshot();
  });
});
