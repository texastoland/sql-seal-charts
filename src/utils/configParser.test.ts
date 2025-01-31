import { parseCode } from "./configParser";

describe('config parser', () => {
    it('should properly parse basic data', () => {
        // Example usage:
        const dot = (config: any) => ({ type: 'dot', ...config });

        // Test the parser
        const testCode = `{
    a: 'test',
    marks: [
        dot({ x: 'x', y: 'something' })
    ]
    }`;

        const res = parseCode(testCode, { dot })
        expect(res).toEqual({
            a: 'test',
            marks: [{
                type: 'dot',
                x: 'x',
                y: 'something'
            }]
        })

    })

    it('should properly parse config with data provided', () => {
        const variables = {
            data: [1, 2, 3, 4],
            config: { value: 42 }
          };
          
          const functions = {
            dot: (config: any) => ({ type: 'dot', ...config })
          };
          
          // This will work:
          const code1 = `{
            a: data[0],
            b: data[1],
            marks: [
              dot({ x: data[2], y: data[3] })
            ]
          }`;

          const res = parseCode(code1, functions, variables)
          expect(res).toEqual({
            a: 1,
            b: 2,
            marks: [{
                type: 'dot',
                x: 3,
                y: 4
            }]
          })
    })

    it('should properly parse config with arrow functions and template literals', () => {
      const variables = {
          data: [1, 2, 3, 4],
          config: { value: 42 }
        };
        
        const functions = {
          dot: (config: any) => ({ type: 'dot', ...config }),
          column: (name: string) => ([1,2,3])
        };
        
        // This will work:
        const code1 = `{
          a: data[0],
          b: data[1],
          fn: (x) => \`\${x.a.b[0]} DATA\`,
          data: column('data'),
          marks: [
            dot({ x: data[2], y: data[3] })
          ]
        }`;

        const res = parseCode(code1, functions, variables)
        expect(res).toEqual({
          a: 1,
          b: 2,
          fn: expect.any(Function),
          data: [1,2,3],
          marks: [{
              type: 'dot',
              x: 3,
              y: 4
          }]
        })
  })
})