export enum RoleMatchingMode {
  all = 'all',
  any = 'any',
}

export interface RoleDecoratorOptionsInterface {
  roles: string[];
  RoleMatchingMode?: RoleMatchingMode;
}
