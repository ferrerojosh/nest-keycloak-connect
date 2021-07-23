import { AuthGuard } from './auth.guard';
import * as KeycloakConnect from 'keycloak-connect';
import * as sinon from 'ts-sinon';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';
import { KeycloakLogger } from '../logger';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import {
  META_SKIP_AUTH,
  META_UNPROTECTED,
} from '../decorators/unprotected.decorator';

describe('AuthGuard', () => {
  let keycloakStub: sinon.StubbedInstance<KeycloakConnect.Keycloak>;
  let keycloakOptionsStub: sinon.StubbedInstance<KeycloakConnectOptions>;
  let reflectorStub: sinon.StubbedInstance<Reflector>;

  let guard: AuthGuard;

  beforeEach(() => {
    keycloakStub = sinon.stubInterface<KeycloakConnect.Keycloak>();
    keycloakOptionsStub = sinon.stubInterface<KeycloakConnectOptions>();
    reflectorStub = sinon.stubInterface<Reflector>();

    guard = new AuthGuard(
      keycloakStub,
      keycloakOptionsStub,
      new KeycloakLogger([]),
      reflectorStub,
    );
  });

  describe('canActivate', () => {
    it('should return true if unprotected and skipAuth decorator is used', async () => {
      const contextStub = sinon.stubInterface<ExecutionContext>();
      reflectorStub.getAllAndOverride
        .withArgs(META_UNPROTECTED, [
          contextStub.getClass(),
          contextStub.getHandler(),
        ])
        .returns(true);
      reflectorStub.getAllAndOverride
        .withArgs(META_SKIP_AUTH, [
          contextStub.getClass(),
          contextStub.getHandler(),
        ])
        .returns(true);

      const delegate = guard.canActivate(contextStub);

      await expect(delegate).resolves.toEqual(true);
    });
  });
});
