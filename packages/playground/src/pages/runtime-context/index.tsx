import {
  Header,
  HeaderTitle,
  MainContentContent,
  MainContentLayout,
  RuntimeContext,
  RuntimeContextWrapper,
} from '@vibeflow/playground-ui';

export default function RuntimeContextPage() {
  return (
    <MainContentLayout>
      <Header>
        <HeaderTitle>Runtime Context</HeaderTitle>
      </Header>

      <MainContentContent>
        <RuntimeContextWrapper>
          <RuntimeContext />
        </RuntimeContextWrapper>
      </MainContentContent>
    </MainContentLayout>
  );
}
