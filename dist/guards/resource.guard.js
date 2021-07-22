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
exports.ResourceGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const KeycloakConnect = __importStar(require("keycloak-connect"));
const constants_1 = require("../constants");
const enforcer_options_decorator_1 = require("../decorators/enforcer-options.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
const resource_decorator_1 = require("../decorators/resource.decorator");
const scopes_decorator_1 = require("../decorators/scopes.decorator");
const util_1 = require("../util");
/**
 * This adds a resource guard, which is policy enforcement by default is permissive.
 * Only controllers annotated with `@Resource` and methods with `@Scopes`
 * are handled by this guard.
 */
let ResourceGuard = class ResourceGuard {
    constructor(keycloak, keycloakOpts, logger, reflector) {
        this.keycloak = keycloak;
        this.keycloakOpts = keycloakOpts;
        this.logger = logger;
        this.reflector = reflector;
    }
    canActivate(context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const resource = this.reflector.get(resource_decorator_1.META_RESOURCE, context.getClass());
            const scopes = this.reflector.get(scopes_decorator_1.META_SCOPES, context.getHandler());
            const isUnprotected = this.reflector.getAllAndOverride(public_decorator_1.META_UNPROTECTED, [context.getClass(), context.getHandler()]);
            const enforcerOpts = this.reflector.getAllAndOverride(enforcer_options_decorator_1.META_ENFORCER_OPTIONS, [context.getClass(), context.getHandler()]);
            // Default to permissive
            const pem = this.keycloakOpts.policyEnforcement || constants_1.PolicyEnforcementMode.PERMISSIVE;
            const shouldAllow = pem === constants_1.PolicyEnforcementMode.PERMISSIVE;
            // No resource given, check policy enforcement mode
            if (!resource) {
                if (shouldAllow) {
                    this.logger.verbose(`Controller has no @Resource defined, request allowed due to policy enforcement`);
                }
                else {
                    this.logger.verbose(`Controller has no @Resource defined, request denied due to policy enforcement`);
                }
                return shouldAllow;
            }
            // No scopes given, check policy enforcement mode
            if (!scopes) {
                if (shouldAllow) {
                    this.logger.verbose(`Route has no @Scope defined, request allowed due to policy enforcement`);
                }
                else {
                    this.logger.verbose(`Route has no @Scope defined, request denied due to policy enforcement`);
                }
                return shouldAllow;
            }
            this.logger.verbose(`Protecting resource [ ${resource} ] with scopes: [ ${scopes} ]`);
            // Build permissions
            const permissions = scopes.map(scope => `${resource}:${scope}`);
            // Extract request/response
            const [request, response] = util_1.extractRequest(context);
            if (!request.user && isUnprotected) {
                this.logger.verbose(`Route has no user, and is public, allowed`);
                return true;
            }
            const user = (_b = (_a = request.user) === null || _a === void 0 ? void 0 : _a.preferred_username) !== null && _b !== void 0 ? _b : 'user';
            const enforcerFn = createEnforcerContext(request, response, enforcerOpts);
            const isAllowed = yield enforcerFn(this.keycloak, permissions);
            // If statement for verbose logging only
            if (!isAllowed) {
                this.logger.verbose(`Resource [ ${resource} ] denied to [ ${user} ]`);
            }
            else {
                this.logger.verbose(`Resource [ ${resource} ] granted to [ ${user} ]`);
            }
            return isAllowed;
        });
    }
};
ResourceGuard = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(constants_1.KEYCLOAK_INSTANCE)),
    __param(1, common_1.Inject(constants_1.KEYCLOAK_CONNECT_OPTIONS)),
    __param(2, common_1.Inject(constants_1.KEYCLOAK_LOGGER)),
    __metadata("design:paramtypes", [Object, Object, common_1.Logger,
        core_1.Reflector])
], ResourceGuard);
exports.ResourceGuard = ResourceGuard;
const createEnforcerContext = (request, response, options) => (keycloak, permissions) => 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
new Promise((resolve, _) => 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
keycloak.enforcer(permissions, options)(request, response, (_) => {
    if (request.resourceDenied) {
        resolve(false);
    }
    else {
        resolve(true);
    }
}));
