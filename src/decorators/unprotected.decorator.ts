import { SetMetadata } from '@nestjs/common';

export const META_UNPROTECTED = 'unprotected';

/**
 * Allow user to use unprotected routes.
 * @since 1.2.0
 */
export const Unprotected = () => SetMetadata(META_UNPROTECTED, true);

/**
 * Alias for `@Unprotected`.
 * @since 1.2.0
 */ 
export const Public = () => SetMetadata(META_UNPROTECTED, true);
