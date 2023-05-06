import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Button, TextInput } from 'react-native';
import { StartScreenNavigationProp } from 'src/navigation/types';

const ImportMnemonic = () => {
	const navigation = useNavigation<StartScreenNavigationProp>();
	const [length, setLength] = useState<'12' | '24'>('24');
	const [mnemonic, setMnemonic] = useState('');

	const importSeedPhrase = () => {
		if (mnemonic.length > 0) {
			navigation.navigate('ChooseParameters', {
				mnemonic,
				isImport: true,
			});
		}
	};

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					marginBottom: 12,
				}}>
				<View
					style={{
						marginRight: 12,
					}}>
					<Button
						color={length === '24' ? 'green' : undefined}
						title="24"
						onPress={() => setLength('24')}
					/>
				</View>

				<Button
					color={length === '12' ? 'green' : undefined}
					title="12"
					onPress={() => setLength('12')}
				/>
			</View>

			<TextInput
				style={{
					height: 40,
					marginBottom: 12,
					borderWidth: 1,
					padding: 10,
				}}
				onChangeText={setMnemonic}
				value={mnemonic}
				placeholder="Enter mnemonic"
			/>

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}>
				<View style={{ marginRight: 12 }}>
					<Button title="Back" onPress={() => navigation.goBack()} />
				</View>
				<Button title="Recover" onPress={importSeedPhrase} />
			</View>
		</View>
	);
};

export default ImportMnemonic;
