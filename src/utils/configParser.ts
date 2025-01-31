import * as acorn from 'acorn';
import { Node, ObjectExpression, Property, CallExpression, Identifier, Literal, 
         ArrayExpression, MemberExpression, ArrowFunctionExpression, BlockStatement,
         TemplateLiteral } from 'estree';

type AllowedFunctions = Record<string, (...args: any[]) => any>;
type AllowedVariables = Record<string, any>;

// Extended to include function scope
interface EvaluationContext {
  allowedFunctions: AllowedFunctions;
  allowedVariables: AllowedVariables;
  scope: Record<string, any>;
}

export function parseCode(
  code: string, 
  allowedFunctions: AllowedFunctions = {},
  allowedVariables: AllowedVariables = {}
) {
  const wrappedCode = `(${code})`;

  const ast = acorn.parse(wrappedCode, {
    ecmaVersion: 2020,
    sourceType: 'module'
  }) as any;

  const context: EvaluationContext = {
    allowedFunctions,
    allowedVariables,
    scope: {}
  };

  function evaluateNode(node: Node, context: EvaluationContext): any {
    if (!node) {
      throw new Error('Null node encountered');
    }

    switch (node.type) {
      case 'ObjectExpression':
        return evaluateObject(node as ObjectExpression, context);
      case 'ArrayExpression':
        return evaluateArray(node as ArrayExpression, context);
      case 'CallExpression':
        return evaluateCall(node as CallExpression, context);
      case 'Identifier':
        return evaluateIdentifier(node as Identifier, context);
      case 'Literal':
        return (node as Literal).value;
      case 'MemberExpression':
        return evaluateMemberExpression(node as MemberExpression, context);
      case 'ArrowFunctionExpression':
        return evaluateArrowFunction(node as ArrowFunctionExpression, context);
      case 'BlockStatement':
        return evaluateBlockStatement(node as BlockStatement, context);
      case 'TemplateLiteral':
        return evaluateTemplateLiteral(node as any, context);
      case 'TemplateElement':
        return (node as any).value.cooked;
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  function evaluateArrowFunction(node: ArrowFunctionExpression, context: EvaluationContext): Function {
    return (...args: any[]) => {
      // Create a new scope for the function execution
      const functionContext: EvaluationContext = {
        ...context,
        scope: { ...context.scope }
      };

      // Bind parameters to arguments
      node.params.forEach((param, index) => {
        if (param.type === 'Identifier') {
          functionContext.scope[param.name] = args[index];
        } else {
          throw new Error('Only simple parameter names are supported');
        }
      });

      // Handle both expression and block body
      if (node.body.type === 'BlockStatement') {
        return evaluateBlockStatement(node.body, functionContext);
      } else {
        return evaluateNode(node.body, functionContext);
      }
    };
  }

  function evaluateBlockStatement(node: BlockStatement, context: EvaluationContext): any {
    let result: any;
    for (const statement of node.body) {
      result = evaluateNode(statement, context);
    }
    return result; // Returns the value of the last statement
  }

  function evaluateTemplateLiteral(node: TemplateLiteral, context: EvaluationContext): string {
    let result = '';
    const expressions = node.expressions;
    const quasis = node.quasis;
    
    for (let i = 0; i < quasis.length; i++) {
      // Add the template string part
      result += evaluateNode(quasis[i], context);
      
      // Add the expression value if there is one
      if (i < expressions.length) {
        const value = evaluateNode(expressions[i], context);
        result += value != null ? String(value) : '';
      }
    }
    
    return result;
  }

  function evaluateIdentifier(node: Identifier, context: EvaluationContext): any {
    const varName = node.name;
    // Check scope first, then allowed variables
    if (context.scope.hasOwnProperty(varName)) {
      return context.scope[varName];
    }
    if (context.allowedVariables.hasOwnProperty(varName)) {
      return context.allowedVariables[varName];
    }
    throw new Error(`Variable "${varName}" is not allowed`);
  }

  function evaluateMemberExpression(node: MemberExpression, context: EvaluationContext): any {
    // Evaluate the object part of the member expression
    const object = node.object.type === 'MemberExpression' 
      ? evaluateMemberExpression(node.object, context)
      : node.object.type === 'Identifier' 
        ? evaluateIdentifier(node.object, context)
        : evaluateNode(node.object, context);

    if (object == null) {
      throw new Error('Cannot access properties of null or undefined');
    }

    // Handle computed (bracket notation) access
    if (node.computed) {
      const propertyValue = evaluateNode(node.property, context);
      if (typeof propertyValue !== 'number' && typeof propertyValue !== 'string') {
        throw new Error('Property access must use number or string');
      }
      return object[propertyValue];
    }

    // Handle dot notation access
    if (node.property.type === 'Identifier') {
      return object[node.property.name];
    }

    throw new Error('Invalid property access');
  }

  function evaluateObject(node: ObjectExpression, context: EvaluationContext): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const prop of node.properties) {
      const property = prop as Property;
      const key = property.key.type === 'Identifier' ? 
        property.key.name : 
        (property.key as Literal).value;
      
      result[key as string] = evaluateNode(property.value, context);
    }
    
    return result;
  }

  function evaluateArray(node: ArrayExpression, context: EvaluationContext): any[] {
    return node.elements.map(element => 
      element ? evaluateNode(element, context) : null
    );
  }

  function evaluateCall(node: CallExpression, context: EvaluationContext): any {
    let func: Function;
    
    if (node.callee.type === 'Identifier') {
      const callee = node.callee.name;
      if (!context.allowedFunctions[callee]) {
        throw new Error(`Function "${callee}" is not allowed`);
      }
      func = context.allowedFunctions[callee];
    } else if (node.callee.type === 'ArrowFunctionExpression') {
      func = evaluateArrowFunction(node.callee as ArrowFunctionExpression, context);
    } else {
      throw new Error('Unsupported function call type');
    }

    const args = node.arguments.map(arg => evaluateNode(arg, context));
    return func(...args);
  }

  const expressionStatement = ast.body[0];
  if (!expressionStatement || expressionStatement.type !== 'ExpressionStatement') {
    throw new Error('Invalid input structure');
  }

  return evaluateNode(expressionStatement.expression, context);
}