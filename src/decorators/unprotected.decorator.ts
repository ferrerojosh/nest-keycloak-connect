import { SetMetadata } from '@nestjs/common';

export const META_UNPROTECTED = 'unprotected';

/**
 * Allow user to use unprotected routes.
 */
export const Unprotected = () => SetMetadata(META_UNPROTECTED, true);

/**
 * Alias for `@Unprotected`.
 */ 
export const Public = () => SetMetadata(META_UNPROTECTED, true);
