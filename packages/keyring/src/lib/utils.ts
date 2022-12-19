/* eslint-disable @typescript-eslint/no-explicit-any */
import { flowResult } from 'mobx';
import { CancellablePromise } from 'mobx/dist/internal';

/**
 * Workaround for AsyncGenerator types, there are some issues with the default definition: https://github.com/mobxjs/mobx/issues/3357
 */
export const asyncFlowResult = <T>(result: T) => {
	return flowResult(result) as T extends AsyncGenerator<any, infer R, any>
		? CancellablePromise<R>
		: T extends CancellablePromise<any>
		? T
		: never;
};
