import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  HeaderContainer,
  HeaderTitle,
  HeaderOnboarding,
  HeaderSocialLinks,
  HeaderButtonSignIn,
  HeaderHome,
  HeaderSignIn,
  HeaderNavigationButtons,
} from './Header';

const meta: Meta<typeof HeaderContainer> = {
  title: 'Molecules/Header',
  component: HeaderContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Header components for different states of the application including home, sign-in, and authenticated states.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderContainerStory: Story = {
  render: () => (
    <HeaderContainer>
      <div className="flex items-center justify-between w-full">
        <HeaderTitle currentTitle="Welcome to Pubky" />
        <HeaderHome />
      </div>
    </HeaderContainer>
  ),
};

export const HeaderTitleStory: Story = {
  render: () => <HeaderTitle currentTitle="Dashboard" />,
};

export const HeaderOnboardingStory: Story = {
  render: () => <HeaderOnboarding currentStep={3} />,
};

export const HeaderSocialLinksStory: Story = {
  render: () => <HeaderSocialLinks />,
};

export const HeaderButtonSignInStory: Story = {
  render: () => <HeaderButtonSignIn />,
};

export const HeaderHomeStory: Story = {
  render: () => <HeaderHome />,
};

export const HeaderSignInStory: Story = {
  render: () => <HeaderSignIn />,
};

export const HeaderNavigationButtonsStory: Story = {
  render: () => <HeaderNavigationButtons />,
};

export const HeaderNavigationButtonsWithCounter: Story = {
  render: () => <HeaderNavigationButtons image="https://i.pravatar.cc/150?img=68" counter={5} />,
};

export const HeaderNavigationButtonsWithHighCounter: Story = {
  render: () => <HeaderNavigationButtons image="https://i.pravatar.cc/150?img=68" counter={25} />,
};

export const CompleteHeader: Story = {
  render: () => (
    <HeaderContainer>
      <div className="flex items-center justify-between w-full">
        <HeaderTitle currentTitle="Feed" />
        <HeaderSignIn />
      </div>
    </HeaderContainer>
  ),
};
