import { SetMetadata, applyDecorators } from '@nestjs/common';

export const META_UNPROTECTED = 'unprotected';
export const META_SKIP_AUTH = 'skip-auth';

/**
 * Allow user to use unprotected routes.
 * @since 1.2.0
 * @param skipAuth attaches authorization header to user object when `false`, defaults to `true`
 */
export const Unprotected = (skipAuth = true) =>
  applyDecorators(
    SetMetadata(META_UNPROTECTED, true),
    SetMetadata(META_SKIP_AUTH, skipAuth),
  );

/**
 * Alias for `@Unprotected`.
 * @since 1.2.0
 * @param skipAuth attaches authorization header to user object when `false`, defaults to `true`
 */
export const Public = (skipAuth = true) =>
  applyDecorators(
    SetMetadata(META_UNPROTECTED, true),
    SetMetadata(META_SKIP_AUTH, skipAuth),
  );
