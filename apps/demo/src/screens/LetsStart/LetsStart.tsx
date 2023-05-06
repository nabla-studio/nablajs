import { useNavigation } from '@react-navigation/native';
import { View, Button } from 'react-native';
import { StartScreenNavigationProp } from 'src/navigation/types';

const LetsStart = () => {
	const navigation = useNavigation<StartScreenNavigationProp>();

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Button title="Back" onPress={() => navigation.goBack()} />

			<Button
				title="Let's start"
				onPress={() => navigation.navigate('SaveMnemonic')}
			/>
		</View>
	);
};

export default LetsStart;
