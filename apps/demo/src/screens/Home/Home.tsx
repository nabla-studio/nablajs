import { View, Text, Button } from 'react-native';
import { observer } from 'mobx-react';
import { keyring } from '../../stores';

const Home = observer(() => {
	const reset = async () => {
		await keyring.reset();
	};

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text selectable>{keyring.currentMnemonic}</Text>
			{keyring.currentAccounts.map(account => (
				<Text selectable key={account.address}>
					{account.address}
				</Text>
			))}
			<Text
				style={{
					marginBottom: 12,
					textAlign: 'center',
				}}>
				You have a wallet now{'\n'}Unlocked: {keyring.unlocked ? 'true' : 'false'}
			</Text>

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}>
				<Button title="Reset" onPress={reset} />
			</View>
		</View>
	);
});

export default Home;
