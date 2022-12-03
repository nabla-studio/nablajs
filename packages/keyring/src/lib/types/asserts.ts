export type Nullable<T> = T | null | undefined;

export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
	if (value === undefined || value === null) {
		throw new Error(`${value} is not defined`);
	}
}

export function assertKeyringUnlocked<T>(
	value: T,
): asserts value is NonNullable<T> {
	if (value === undefined || value === null) {
		throw new Error('The Keyring is locked, you must unlock it');
	}
}

export function assertOutOfIndex(index: number, length: number) {
	if (index < 0 || index > length - 1) {
		throw new Error(
			`IndexError: the index ${index} is greater then ${
				length - 1
			} or less then zero`,
		);
	}
}
