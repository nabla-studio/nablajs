import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import { StartScreenNavigationProp } from '../../navigation/types';
import { keyring } from '../../stores';

const SaveMnemonic = () => {
	const navigation = useNavigation<StartScreenNavigationProp>();
	const [mnemonic, setMnemonic] = useState<string>();

	useEffect(() => {
		async function fetchData() {
			try {
				const start = performance.now()
				const m = keyring.generateMnemonic(24);
				const end = performance.now()
				console.log(`Create a Wallet took ${end - start} ms.`)
				setMnemonic(m);
			} catch (error) {
				console.error(error)
			}
		}
		fetchData();
	}, []);

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text
				selectable={true}
				style={{
					marginBottom: 12,
				}}>
				{mnemonic}
			</Text>

			<View
				style={{
					marginBottom: 12,
				}}>
				<Button
					title="Proceed without BIP85"
					onPress={() => navigation.navigate('ChooseNickname', { mnemonic })}
				/>
			</View>

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}>
				<View style={{ marginRight: 12 }}>
					<Button title="Back" onPress={() => navigation.goBack()} />
				</View>
				<Button
					title="Continue"
					onPress={() => navigation.navigate('ChooseParameters', { mnemonic })}
				/>
			</View>
		</View>
	);
};

export default SaveMnemonic;
