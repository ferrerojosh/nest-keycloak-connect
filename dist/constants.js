"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidation = exports.PolicyEnforcementMode = exports.RoleMatchingMode = exports.KEYCLOAK_COOKIE_DEFAULT = exports.KEYCLOAK_LOGGER = exports.KEYCLOAK_INSTANCE = exports.KEYCLOAK_CONNECT_OPTIONS = void 0;
/**
 * Used internally, provides keycloak options for the Nest guards.
 */
exports.KEYCLOAK_CONNECT_OPTIONS = 'KEYCLOAK_CONNECT_OPTIONS';
/**
 * Key for injecting a keycloak instance.
 */
exports.KEYCLOAK_INSTANCE = 'KEYCLOAK_INSTANCE';
/**
 * Key for injecting the nest keycloak logger.
 */
exports.KEYCLOAK_LOGGER = 'KEYCLOAK_LOGGER';
/**
 * Default cookie key.
 */
exports.KEYCLOAK_COOKIE_DEFAULT = 'KEYCLOAK_JWT';
/**
 * Role matching mode.
 */
var RoleMatchingMode;
(function (RoleMatchingMode) {
    /**
     * Match all roles
     */
    RoleMatchingMode["ALL"] = "all";
    /**
     * Match any roles
     */
    RoleMatchingMode["ANY"] = "any";
})(RoleMatchingMode = exports.RoleMatchingMode || (exports.RoleMatchingMode = {}));
/**
 * Policy enforcement mode.
 */
var PolicyEnforcementMode;
(function (PolicyEnforcementMode) {
    /**
     * Deny all request when there is no matching resource.
     */
    PolicyEnforcementMode["ENFORCING"] = "enforcing";
    /**
     * Allow all request even when there's no matching resource.
     */
    PolicyEnforcementMode["PERMISSIVE"] = "permissive";
})(PolicyEnforcementMode = exports.PolicyEnforcementMode || (exports.PolicyEnforcementMode = {}));
/**
 * Token validation methods.
 */
var TokenValidation;
(function (TokenValidation) {
    /**
     * The default validation method, performs live validation via Keycloak servers.
     */
    TokenValidation["ONLINE"] = "online";
    /**
     * Validate offline against the configured keycloak options.
     */
    TokenValidation["OFFLINE"] = "offline";
    /**
     * Does not check for any validation. Should only be used for special cases (i.e development, internal networks)
     */
    TokenValidation["NONE"] = "none";
})(TokenValidation = exports.TokenValidation || (exports.TokenValidation = {}));
