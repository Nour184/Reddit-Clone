import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

const jestConfig = {
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },
};

export default jestConfig;