import { SetMetadata } from '@nestjs/common';

export const META_PUBLIC = 'public';

/**
 * Allows unauthorized traffic to enter the route.
 * @since 1.2.0
 * @param skipAuth attaches authorization header to user object when `false`, defaults to `true`
 */
export const Public = () => SetMetadata(META_PUBLIC, true);
