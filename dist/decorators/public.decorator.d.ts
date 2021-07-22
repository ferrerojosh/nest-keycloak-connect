export declare const META_UNPROTECTED = "unprotected";
export declare const META_SKIP_AUTH = "skip-auth";
/**
 * Allow user to use unprotected routes.
 * @since 1.2.0
 * @param skipAuth attaches authorization header to user object when `false`, defaults to `true`
 */
export declare const Unprotected: (skipAuth?: boolean) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
/**
 * Alias for `@Unprotected`.
 * @since 1.2.0
 * @param skipAuth attaches authorization header to user object when `false`, defaults to `true`
 */
export declare const Public: (skipAuth?: boolean) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
