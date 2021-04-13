import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import axios from 'axios';

const KEYCLOAK_AUTH =
  'http://localhost:8080/auth/realms/nest-example/protocol/openid-connect/token';
const KEYCLOAK_USER = 'user';
const KEYCLOAK_PASS = 'user';
const KEYCLOAK_AUTH_PARAMS = `grant_type=password&scope=openid&username=${KEYCLOAK_USER}&password=${KEYCLOAK_PASS}&client_id=postman`;

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await axios.post(KEYCLOAK_AUTH, KEYCLOAK_AUTH_PARAMS, {
      headers: {
        'Accept': 'application/json'
      }
    });

    accessToken = response.data.access_token;
  });

  it('/ (GET, no token)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello world!');
  });

  it('/ (GET, with token)', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect('Hello user');
  });
  
  it('/product (GET, no token)', () => {
    return request(app.getHttpServer())
      .get('/product')
      .expect(200)
  });

  it('/product (GET, with token)', () => {
    return request(app.getHttpServer())
      .get('/product')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403)
  });
});
