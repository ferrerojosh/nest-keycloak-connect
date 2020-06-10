import { SetMetadata } from '@nestjs/common';

export const META_UNPROTECTED = 'unprotected';

/**
 * Allow user to use unprotected routes.
 * @param unprotected - Flag to identidy routes which do not need protection
 */


export const Unprotected = () => SetMetadata(META_UNPROTECTED, true);

