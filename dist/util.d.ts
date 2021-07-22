import { ExecutionContext } from '@nestjs/common';
export declare const extractRequest: (context: ExecutionContext) => [any, any];
export declare const parseToken: (token: string) => string;
