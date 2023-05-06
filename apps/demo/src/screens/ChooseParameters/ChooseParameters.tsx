import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, TextInput, Button } from 'react-native';
import {
	StartScreenNavigationProp,
	ChooseParametersScreenRouteProp,
} from '../../navigation/types';
import { keyring } from '../../stores';

const ChooseParameters = () => {
	const navigation = useNavigation<StartScreenNavigationProp>();
	const route = useRoute<ChooseParametersScreenRouteProp>();
	const [index, setIndex] = useState(0);
	const [loading, setLoading] = useState(false);

	const generateChildMnemonic = async () => {
		try {
			setLoading(true);
			if (route.params.mnemonic) {
				const start = performance.now()
				const childMnemonic = await keyring.generateMnemonicFromMaster(
					route.params.mnemonic,
					0,
					24,
					index,
				);
				const end = performance.now()
				console.log(`Child took ${end - start} ms.`)

				navigation.navigate('ChooseNickname', {
					mnemonic: childMnemonic,
					isBip85: true,
					index,
				});
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const skipBIP85 = () => {
		navigation.navigate('ChooseNickname', {
			mnemonic: route.params.mnemonic,
			isBip85: false,
		});
	};

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text
				style={{
					marginBottom: 12,
				}}>
				Choose parameters
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
				onChangeText={text => setIndex(parseInt(text, 10))}
				value={index.toString()}
				placeholder="Ex. 0, 1, 2.."
				keyboardType="number-pad"
			/>

			{route.params.isImport ? (
				<View style={{ marginBottom: 12 }}>
					<Button title="Proceed without BIP85  " onPress={skipBIP85} />
				</View>
			) : null}

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}>
				<View style={{ marginRight: 12 }}>
					<Button title="Back" onPress={() => navigation.goBack()} />
				</View>
				<Button title="Continue" onPress={generateChildMnemonic} />
			</View>
		</View>
	);
};

export default ChooseParameters;
