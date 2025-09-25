import { useScorers } from '@vibeflow/playground-ui';
import { Header, HeaderTitle, MainContentLayout, ScorersTable } from '@vibeflow/playground-ui';

export default function Scorers() {
  const { scorers = {}, isLoading } = useScorers();

  return (
    <MainContentLayout>
      <Header>
        <HeaderTitle>Scorers</HeaderTitle>
      </Header>

      <ScorersTable isLoading={isLoading} scorers={scorers} />
    </MainContentLayout>
  );
}
