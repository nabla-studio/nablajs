import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type StartStackNavigatorParamList = {
	Intro: undefined;
	LetsStart: undefined;
	ImportMnemonic: undefined;
	SaveMnemonic: undefined;
	Home: undefined;
	ChooseNickname: {
		mnemonic?: string;
		isBip85?: boolean;
		index?: number;
	};
	ChooseParameters: {
		mnemonic?: string;
		isImport?: boolean;
	};
};

export type StartScreenNavigationProp = NativeStackNavigationProp<
	StartStackNavigatorParamList,
	keyof StartStackNavigatorParamList
>;

export type ChooseNicknameScreenRouteProp = RouteProp<
	StartStackNavigatorParamList,
	'ChooseNickname'
>;

export type ChooseParametersScreenRouteProp = RouteProp<
	StartStackNavigatorParamList,
	'ChooseParameters'
>;
