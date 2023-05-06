import { NavigationContainer } from '@react-navigation/native';

import StartStack from './StartStack';

const RootNavigator = () => {
	return (
		<NavigationContainer>
			<StartStack />
		</NavigationContainer>
	);
};

export default RootNavigator;
