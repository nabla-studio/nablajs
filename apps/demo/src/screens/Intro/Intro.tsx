import { useNavigation } from '@react-navigation/native';
import { View, Button } from 'react-native';
import { StartScreenNavigationProp } from 'src/navigation/types';

const Intro = () => {
	const navigation = useNavigation<StartScreenNavigationProp>();

	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Button
				title="Let's Start"
				onPress={() => navigation.navigate('LetsStart')}
			/>

			<Button
				title="I already have a seed phrase"
				onPress={() => navigation.navigate('ImportMnemonic')}
			/>
		</View>
	);
};

export default Intro;
