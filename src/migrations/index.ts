import * as migration_20260830_154246_initial from './20260830_154246_initial';

export const migrations = [
  {
    up: migration_20260830_154246_initial.up,
    down: migration_20260830_154246_initial.down,
    name: '20260830_154246_initial'
  },
];
