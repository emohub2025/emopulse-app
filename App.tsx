import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { CycleTimerProvider } from './src/components/CycleTimerContext';

export default function App() {
  return (
    <CycleTimerProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </CycleTimerProvider>
  );
}