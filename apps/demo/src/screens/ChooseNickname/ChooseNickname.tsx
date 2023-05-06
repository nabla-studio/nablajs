import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, TextInput, Button } from 'react-native';
import {
	StartScreenNavigationProp,
	ChooseNicknameScreenRouteProp,
} from '../../navigation/types';
import { keyring } from '../../stores';

const ChooseNickname = () => {
	const navigation = useNavigation<StartScreenNavigationProp>();
	const route = useRoute<ChooseNicknameScreenRouteProp>();
	const [nick, setNick] = useState('');
	const [loading, setLoading] = useState(false);

	const initKeyring = async () => {
		try {
			setLoading(true);
			if (route.params.mnemonic && nick.length > 0) {
				const metadata = route.params.isBip85
					? {
							isBip85: route.params.isBip85,
							index: route.params.index,
					  }
					: undefined;

					const start = performance.now()
				await keyring.init('123', route.params.mnemonic, nick, metadata);
				const end = performance.now()
				console.log(`Init took ${end - start} ms.`)
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text
				style={{
					marginBottom: 12,
				}}>
				Yeah, the last step
			</Text>

			{loading ? (
				<Text
					style={{
						marginBottom: 12,
					}}>
					Loading...
				</Text>
			) : null}

			<TextInput
				style={{
					height: 40,
					marginBottom: 12,
					borderWidth: 1,
					padding: 10,
				}}
				onChangeText={setNick}
				value={nick}
				placeholder="@example"
			/>

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}>
				<View style={{ marginRight: 12 }}>
					<Button title="Back" onPress={() => navigation.goBack()} />
				</View>
				<Button title="Let’s start" onPress={initKeyring} />
			</View>
		</View>
	);
};

export default ChooseNickname;
