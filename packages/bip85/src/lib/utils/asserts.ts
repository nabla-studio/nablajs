export function assertValidIndex(index: number) {
	if (!(typeof index === 'number' && index >= 0)) {
		throw new Error('Invalid index');
	}
}

export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
	if (value === undefined || value === null) {
		throw new Error(`${value} is not defined`);
	}
}

export function assertIsTypeOf<T>(value: T, type: string): asserts value is T {
	if (typeof value !== type) {
		throw new Error(`${value} is not of type ${type}`);
	}
}

export function assertOutOfRange(index: number, lower: number, upper: number) {
	if (index < lower || index > upper) {
		throw new Error(
			`RangeError: the index ${index} is greater then ${upper} or less then ${lower}`,
		);
	}
}
