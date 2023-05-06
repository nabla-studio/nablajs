import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StartStackNavigatorParamList } from './types';
import {
	Intro,
	LetsStart,
	ImportMnemonic,
	SaveMnemonic,
	ChooseNickname,
	ChooseParameters,
	Home,
} from '../screens';
import { keyring } from '../stores';
import { observer } from 'mobx-react';

const StartStack = createNativeStackNavigator<StartStackNavigatorParamList>();

const StartStackNavigator = observer(() => {
	useEffect(() => {
		const unlock = async () => {
			try {
				const empty = await keyring.empty();

				if (!empty) {
					await keyring.unlock('123');
				}
			} catch (error) {
				console.error(error);
			}
		};

		unlock();
	}, []);

	return (
		<StartStack.Navigator>
			{keyring.unlocked ? (
				<StartStack.Screen name="Home" component={Home} />
			) : (
				<>
					<StartStack.Screen name="Intro" component={Intro} />
					<StartStack.Screen name="LetsStart" component={LetsStart} />
					<StartStack.Screen name="ImportMnemonic" component={ImportMnemonic} />
					<StartStack.Screen name="SaveMnemonic" component={SaveMnemonic} />
					<StartStack.Screen name="ChooseNickname" component={ChooseNickname} />
					<StartStack.Screen name="ChooseParameters" component={ChooseParameters} />
				</>
			)}
		</StartStack.Navigator>
	);
});

export default StartStackNavigator;
