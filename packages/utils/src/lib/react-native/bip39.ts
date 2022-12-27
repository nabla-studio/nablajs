import AES from 'react-native-aes-crypto';

export const nfkd = (str: string) => {
	if (typeof str !== 'string') {
		throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
	}

	return str.normalize('NFKD');
};

export const normalize = (str: string) => {
	const norm = nfkd(str);
	const words = norm.split(' ');

	if (![12, 15, 18, 21, 24].includes(words.length)) {
		throw new Error('Invalid mnemonic');
	}

	return { nfkd: norm, words };
};

export const mnemonicToSeed = async (
	mnemonic: string,
	passphrase = '',
	pbkdf2cost = 2048,
	pbkdf2length = 64,
) => {
	const salt = 'mnemonic' + (passphrase ? normalize(passphrase).nfkd : '');

	return await AES.pbkdf2(
		normalize(mnemonic).nfkd,
		salt,
		pbkdf2cost,
		pbkdf2length,
	);
};
