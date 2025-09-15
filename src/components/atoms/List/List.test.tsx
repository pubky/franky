import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { List } from './List';

describe('List - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <List>
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different HTML elements', () => {
    const { container: ulContainer } = render(
      <List as="ul">
        <li>Unordered item</li>
      </List>,
    );
    expect(ulContainer.firstChild).toMatchSnapshot();

    const { container: olContainer } = render(
      <List as="ol">
        <li>Ordered item</li>
      </List>,
    );
    expect(olContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different variants', () => {
    const { container: defaultContainer } = render(
      <List variant="default">
        <li>Default item</li>
      </List>,
    );
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: decimalContainer } = render(
      <List variant="decimal">
        <li>Decimal item</li>
      </List>,
    );
    expect(decimalContainer.firstChild).toMatchSnapshot();

    const { container: noneContainer } = render(
      <List variant="none">
        <li>None item</li>
      </List>,
    );
    expect(noneContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: customClassContainer } = render(
      <List className="custom-list-class">
        <li>Custom class item</li>
      </List>,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();

    const { container: customTestIdContainer } = render(
      <List data-testid="custom-list">
        <li>Custom test ID item</li>
      </List>,
    );
    expect(customTestIdContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different children configurations', () => {
    const { container: singleItemContainer } = render(
      <List>
        <li>Single item</li>
      </List>,
    );
    expect(singleItemContainer.firstChild).toMatchSnapshot();

    const { container: multipleItemsContainer } = render(
      <List>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </List>,
    );
    expect(multipleItemsContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for additional props', () => {
    const { container: withIdContainer } = render(
      <List id="test-list">
        <li>Item with ID</li>
      </List>,
    );
    expect(withIdContainer.firstChild).toMatchSnapshot();

    const { container: withAriaLabelContainer } = render(
      <List aria-label="Test list">
        <li>Item with aria-label</li>
      </List>,
    );
    expect(withAriaLabelContainer.firstChild).toMatchSnapshot();
  });
});
