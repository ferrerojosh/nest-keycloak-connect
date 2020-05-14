import assert = require('assert');
import { AuthGuard } from '../../src';

describe('auth.guard', () => {
  it('extracts jwt token from cookie', () => {
    assert(AuthGuard.extractJwtFromCookie({}) === undefined);
    assert(AuthGuard.extractJwtFromCookie(undefined) === undefined);

    assert(
      AuthGuard.extractJwtFromCookie({
        keycloakJWT: '1234',
      }) === '1234',
    );
  });
});
