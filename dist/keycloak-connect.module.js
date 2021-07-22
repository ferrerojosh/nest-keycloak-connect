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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var KeycloakConnectModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakConnectModule = void 0;
const common_1 = require("@nestjs/common");
const keycloak_connect_1 = __importDefault(require("keycloak-connect"));
const constants_1 = require("./constants");
const logger_1 = require("./logger");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
__exportStar(require("./constants"), exports);
__exportStar(require("./decorators/authenticated-user.decorator"), exports);
__exportStar(require("./decorators/enforcer-options.decorator"), exports);
__exportStar(require("./decorators/resource.decorator"), exports);
__exportStar(require("./decorators/roles.decorator"), exports);
__exportStar(require("./decorators/scopes.decorator"), exports);
__exportStar(require("./decorators/public.decorator"), exports);
__exportStar(require("./guards/auth.guard"), exports);
__exportStar(require("./guards/resource.guard"), exports);
__exportStar(require("./guards/role.guard"), exports);
__exportStar(require("./interface/keycloak-connect-module-async-options.interface"), exports);
__exportStar(require("./interface/keycloak-connect-options-factory.interface"), exports);
__exportStar(require("./interface/keycloak-connect-options.interface"), exports);
__exportStar(require("./interface/role-decorator-options.interface"), exports);
let KeycloakConnectModule = KeycloakConnectModule_1 = class KeycloakConnectModule {
    static parseConfig(opts, config) {
        if (typeof opts === 'string') {
            const configPath = path.join(process.cwd(), opts);
            const json = fs.readFileSync(configPath);
            const keycloakConfig = JSON.parse(json.toString());
            return Object.assign(keycloakConfig, config);
        }
        return opts;
    }
    /**
     * Register the `KeycloakConnect` module.
     * @param opts `keycloak.json` path in string or {@link NestKeycloakConfig} object.
     * @param config {@link NestKeycloakConfig} when using `keycloak.json` path, optional
     * @returns
     */
    static register(opts, config) {
        const optsProvider = {
            provide: constants_1.KEYCLOAK_CONNECT_OPTIONS,
            useValue: KeycloakConnectModule_1.parseConfig(opts, config),
        };
        return {
            module: KeycloakConnectModule_1,
            providers: [optsProvider, this.loggerProvider, this.keycloakProvider],
            exports: [optsProvider, this.loggerProvider, this.keycloakProvider],
        };
    }
    static registerAsync(opts) {
        const optsProvider = this.createConnectProviders(opts);
        return {
            module: KeycloakConnectModule_1,
            imports: opts.imports || [],
            providers: [optsProvider, this.loggerProvider, this.keycloakProvider],
            exports: [optsProvider, this.loggerProvider, this.keycloakProvider],
        };
    }
    static createConnectProviders(options) {
        if (options.useExisting || options.useFactory) {
            return this.createConnectOptionsProvider(options);
        }
        // useClass
        return {
            provide: options.useClass,
            useClass: options.useClass,
        };
    }
    static createConnectOptionsProvider(options) {
        if (options.useFactory) {
            // useFactory
            return {
                provide: constants_1.KEYCLOAK_CONNECT_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        // useExisting
        return {
            provide: constants_1.KEYCLOAK_CONNECT_OPTIONS,
            useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return yield optionsFactory.createKeycloakConnectOptions(); }),
            inject: [options.useExisting || options.useClass],
        };
    }
};
KeycloakConnectModule.logger = new common_1.Logger(KeycloakConnectModule_1.name);
KeycloakConnectModule.loggerProvider = {
    provide: constants_1.KEYCLOAK_LOGGER,
    useFactory: (opts) => {
        if (typeof opts === 'string') {
            return new common_1.Logger('Keycloak');
        }
        if (opts.useNestLogger) {
            return new common_1.Logger('Keycloak');
        }
        return new logger_1.KeycloakLogger(opts.logLevels);
    },
    inject: [constants_1.KEYCLOAK_CONNECT_OPTIONS],
};
KeycloakConnectModule.keycloakProvider = {
    provide: constants_1.KEYCLOAK_INSTANCE,
    useFactory: (opts) => {
        const keycloakOpts = opts;
        const keycloak = new keycloak_connect_1.default({}, keycloakOpts);
        // Warn if using token validation none
        if (typeof opts !== 'string' &&
            opts.tokenValidation &&
            opts.tokenValidation === constants_1.TokenValidation.NONE) {
            KeycloakConnectModule_1.logger.warn(`Token validation is disabled, please only do this on development/special use-cases.`);
        }
        // Access denied is called, add a flag to request so our resource guard knows
        keycloak.accessDenied = (req, res, next) => {
            req.resourceDenied = true;
            next();
        };
        return keycloak;
    },
    inject: [constants_1.KEYCLOAK_CONNECT_OPTIONS],
};
KeycloakConnectModule = KeycloakConnectModule_1 = __decorate([
    common_1.Module({})
], KeycloakConnectModule);
exports.KeycloakConnectModule = KeycloakConnectModule;
