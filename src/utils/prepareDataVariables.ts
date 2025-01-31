import { min, max, uniq, uniqBy, mean } from 'lodash'

interface Config {
    data: Record<string, unknown>[];
    columns: string[];
}

export function prepareDataVariables({ data, columns }: Config) {
    const column = (f: string) => {
        return data.map((d: any) => d[f])
    }

    function array<T>(...arrays: T[][]): T[][] {
        const minLength = Math.min(...arrays.map(arr => arr.length));

        return Array.from({ length: minLength }, (_, i) =>
            arrays.map(arr => arr[i])
        );
    }

    interface ValueDefinition {
        key: string;
        values: any[];
    }

    function assembleObjects(...definitions: ValueDefinition[]): Record<string, any>[] {
        const minLength = Math.min(...definitions.map(def => def.values.length));

        return Array.from({ length: minLength }, (_, index) => {
            return definitions.reduce((obj, def) => {
                obj[def.key] = def.values[index];
                return obj;
            }, {} as Record<string, any>);
        });
    }

    function assemble(def: Record<string, any[]>): Record<string, any>[] {
        const definitions = Object.values(def)
        const minLength = Math.min(...definitions.map(def => def.length));

        return Array.from({ length: minLength }, (_, index) => {
            return Object.entries(def).reduce((obj, [key, value]) => {
                obj[key] = value[index]
                return obj;
            }, {} as Record<string, any>);
        });
    }

    const columnsData: Record<string, unknown> = columns.reduce((acc, col) => ({
        ...acc,
        [col]: column(col)
    }), {})

    return {
        functions: { column, array, assembleObjects, min, max, uniq, uniqBy, assemble, mean },
        variables: { ...columnsData, data, columns } as Record<string, unknown[]>
    }
}