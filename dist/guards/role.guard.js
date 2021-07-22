"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const KeycloakConnect = __importStar(require("keycloak-connect"));
const constants_1 = require("../constants");
const roles_decorator_1 = require("../decorators/roles.decorator");
const util_1 = require("../util");
/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.1.0
 */
let RoleGuard = class RoleGuard {
    constructor(keycloak, logger, reflector) {
        this.keycloak = keycloak;
        this.logger = logger;
        this.reflector = reflector;
    }
    canActivate(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolesMetaData = this.reflector.get(roles_decorator_1.META_ROLES, context.getHandler());
            if (!rolesMetaData || rolesMetaData.roles.length == 0) {
                return true;
            }
            if (rolesMetaData && !rolesMetaData.mode) {
                rolesMetaData.mode = constants_1.RoleMatchingMode.ANY;
            }
            this.logger.verbose(`Roles: `, JSON.stringify(rolesMetaData.roles));
            // Extract request
            const [request] = util_1.extractRequest(context);
            const { accessTokenJWT } = request;
            if (!accessTokenJWT) {
                // No access token attached, auth guard should have attached the necessary token
                this.logger.warn('No access token found in request, are you sure AuthGuard is first in the chain?');
                return false;
            }
            // Create grant
            const grant = yield this.keycloak.grantManager.createGrant({
                access_token: accessTokenJWT,
            });
            // Grab access token from grant
            const accessToken = grant.access_token;
            return rolesMetaData.mode === constants_1.RoleMatchingMode.ANY
                ? rolesMetaData.roles.some(r => accessToken.hasRole(r))
                : rolesMetaData.roles.every(r => accessToken.hasRole(r));
        });
    }
};
RoleGuard = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(constants_1.KEYCLOAK_INSTANCE)),
    __param(1, common_1.Inject(constants_1.KEYCLOAK_LOGGER)),
    __metadata("design:paramtypes", [Object, common_1.Logger,
        core_1.Reflector])
], RoleGuard);
exports.RoleGuard = RoleGuard;
