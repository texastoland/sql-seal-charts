import { prepareDataVariables } from "./prepareDataVariables"

describe('prepare data variables', () => {
    it('should properly prepare variables for the dataset', () => {
        const { functions, variables } = prepareDataVariables({
            data: [{a: 5, b: 9}, { a: 6, b: 10}],
            columns: ['a', 'b']
        })
        expect(variables.data).toHaveLength(2)
        expect(variables.columns).toHaveLength(2)
        expect(variables['a']).toEqual([5, 6])
        expect(variables['b']).toEqual([9, 10])

        expect(functions.max([1,2,3])).toEqual(3)
        expect(functions.min([1,2,3])).toEqual(1)

        expect(functions.mean([1, 2, 3])).toEqual(2)
        expect(functions.column('a')).toEqual([5,6])
        expect(functions.array(functions.column('a'), functions.column('b'))).toEqual([[5, 9], [6, 10]])

        // Assemble and Assemble Objects
        const { assemble, assembleObjects } = functions
        const result = [
            { id: 1, value: 50 },
            { id: 2, value: 51 },
            { id: 3, value: 52 }
        ]
        expect(assembleObjects({ key: 'id', values: [1,2,3]}, { key: 'value', values: [50, 51, 52 ]})).toEqual(result)

        expect(assemble({ id: [1,2,3], value: [50, 51, 52]})).toEqual(result)
    })
})