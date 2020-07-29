interface RawValidOptions {
    type: keyof FormatTypeKeys;
    max: number;
    min: number;
    range: [number, number];
    value?: any;
    isNull: boolean;
    [key: string]: any;
}

export type ValidOptions = Partial<RawValidOptions>;

const defaultOptions: RawValidOptions = {
    type: 'string',
    max: Infinity,
    min: 0,
    range: [0, Infinity],
    isNull: false,
};


export default function valid(options: ValidOptions): (value: string) => string | undefined {
    const { formatType, ...normalOptions } = normal(options);
    let scopedValue: any;
    function validHandler(value: string) {
        const newValue = formatType(value);
        let exitValue;
        exitValue = validBase(newValue, value, normalOptions);
        switch (typeof newValue) {
            case 'string':
                exitValue = validString(newValue, normalOptions);
                break;
            case 'boolean':
                exitValue = validBoolean(newValue, normalOptions);
                break;
            case 'number':
                exitValue = validNumber(newValue, normalOptions);
                break;
        }
        scopedValue = newValue;
        return returnError(exitValue, value, newValue, normalOptions);
    }

    validHandler.to = () => {
        return formatType(scopedValue);
    };

    return validHandler;
}

function validBoolean(value: boolean, options: RawValidOptions) {
    return 0;
}

function validString(value: string, { min, max }: RawValidOptions) {
    if (value.length < min || value.length > max) return 2;
    return 0;
}

function validNumber(value: number, { range }: RawValidOptions) {
    const [start, end] = range;
    if (!range.map(isFinite).some(Boolean)) return 0;
    if (value < start || value > end) return 3;
    return 0;
}

function validBase(value: any, rawValue: any, { isNull, ...options }: RawValidOptions) {
    if ((typeof rawValue === 'undefined' || rawValue === '') && isNull) return 4;
    if ((typeof options.value !== 'undefined' || 'value' in options) && options.value !== value) return 1;
    return 0;
}

/**
 * 0 正常
 * 1 预期值不对
 * 2 长度问题
 * 3 范围不对
 * 4 不能为空值
 * @param exitCode
 * @param val
 * @param newVal
 * @param options
 */
function returnError(exitCode: number, val: any, newVal: any, options: RawValidOptions): string | undefined {
    const { max, min, range, value } = options;
    switch (exitCode) {
        case 1:
            return `"${newVal}" 与预期值 "${value}" 不同`;
        case 2:
            return `"${newVal}" 长度需要在${min}-${max}之间`;
        case 3:
            return `“${newVal}” 范围需要在${range[0]}-${range[1]}之间`;
        case 4:
            return '输入值不能为空';
    }
}

type FormatFun<T> = (value: string) => T;
type FormatTypeKeys = {
    string: FormatFun<string>;
    number: FormatFun<number>;
    boolean: FormatFun<boolean>;
};

const formatType: FormatTypeKeys = {
    string: String,
    number: Number,
    boolean: (value: string) => value === 'true',
};

function normal(options: ValidOptions) {
    const rawOptions = { ...defaultOptions, ...options };

    return {
        formatType: formatType[rawOptions.type],
        ...rawOptions,
    };
}
