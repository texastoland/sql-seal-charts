import * as acorn from 'acorn';
import type {
  Node, ObjectExpression, Property, CallExpression, Identifier,
  Literal, ArrayExpression, MemberExpression, ArrowFunctionExpression,
  BlockStatement, TemplateLiteral, ExpressionStatement, TemplateElement
} from 'acorn';

// Define more specific types for function parameters and returns
type AllowedFunction = (...args: unknown[]) => unknown;
type AllowedFunctions = Record<string, AllowedFunction>;
type AllowedVariables = Record<string, unknown>;

// Extended to include function scope
interface EvaluationContext {
  allowedFunctions: AllowedFunctions;
  allowedVariables: AllowedVariables;
  scope: Record<string, unknown>;
}

export function parseCode(
  code: string, 
  allowedFunctions: AllowedFunctions = {},
  allowedVariables: AllowedVariables = {}
): unknown {
  const wrappedCode = `(${code})`;

  const ast = acorn.parse(wrappedCode, {
    ecmaVersion: 2020,
    sourceType: 'module'
  })

  const context: EvaluationContext = {
    allowedFunctions,
    allowedVariables,
    scope: {}
  };

  function evaluateNode(node: Node, context: EvaluationContext): unknown {
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
        return evaluateTemplateLiteral(node as TemplateLiteral, context);
      case 'TemplateElement':
        return (node as TemplateElement).value.cooked;
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  function evaluateArrowFunction(node: ArrowFunctionExpression, context: EvaluationContext): Function {
    return (...args: unknown[]) => {
      const functionContext: EvaluationContext = {
        ...context,
        scope: { ...context.scope }
      };

      node.params.forEach((param, index) => {
        if (param.type === 'Identifier') {
          functionContext.scope[param.name] = args[index];
        } else {
          throw new Error('Only simple parameter names are supported');
        }
      });

      if (node.body.type === 'BlockStatement') {
        return evaluateBlockStatement(node.body, functionContext);
      } else {
        return evaluateNode(node.body, functionContext);
      }
    };
  }

  function evaluateBlockStatement(node: BlockStatement, context: EvaluationContext) {
    let result: unknown;
    for (const statement of node.body) {
      result = evaluateNode(statement, context);
    }
    return result;
  }

  function evaluateTemplateLiteral(node: TemplateLiteral, context: EvaluationContext): string {
    let result = '';
    
    for (let i = 0; i < node.quasis.length; i++) {
      result += evaluateNode(node.quasis[i], context) as string;
      
      if (i < node.expressions.length) {
        const value = evaluateNode(node.expressions[i], context);
        result += value != null ? String(value) : '';
      }
    }
    
    return result;
  }

  function evaluateIdentifier(node: Identifier, context: EvaluationContext) {
    const varName = node.name;
    
    if (Object.prototype.hasOwnProperty.call(context.scope, varName)) {
      return context.scope[varName];
    }
    if (Object.prototype.hasOwnProperty.call(context.allowedVariables, varName)) {
      return context.allowedVariables[varName];
    }
    throw new Error(`Variable "${varName}" is not allowed`);
  }

  function evaluateMemberExpression(node: MemberExpression, context: EvaluationContext): unknown {
    const object = node.object.type === 'MemberExpression' 
      ? evaluateMemberExpression(node.object, context)
      : node.object.type === 'Identifier' 
        ? evaluateIdentifier(node.object, context)
        : evaluateNode(node.object, context);

    if (object == null) {
      throw new Error('Cannot access properties of null or undefined');
    }

    if (node.computed) {
      const propertyValue = evaluateNode(node.property, context);
      if (typeof propertyValue !== 'number' && typeof propertyValue !== 'string') {
        throw new Error('Property access must use number or string');
      }
      return (object as Record<string | number, unknown>)[propertyValue];
    }

    if (node.property.type === 'Identifier') {
      return (object as Record<string, unknown>)[node.property.name];
    }

    throw new Error('Invalid property access');
  }

  function evaluateObject(node: acorn.ObjectExpression, context: EvaluationContext): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const prop of node.properties) {
      const property = prop as Property;
      const key = property.key.type === 'Identifier' 
        ? property.key.name 
        : (property.key as Literal).value;
      
      if (typeof key === 'string') {
        result[key] = evaluateNode(property.value, context);
      }
    }
    
    return result;
  }

  function evaluateArray(node: ArrayExpression, context: EvaluationContext): unknown[] {
    return node.elements.map(element => 
      element ? evaluateNode(element, context) : null
    );
  }

  const isExpressionStatement = (x:(acorn.Statement | acorn.ModuleDeclaration)): x is ExpressionStatement => {
    return !!x && x.type === 'ExpressionStatement'
  }

  function evaluateCall(node: CallExpression, context: EvaluationContext): unknown {
    let func: Function;
    
    if (node.callee.type === 'Identifier') {
      const callee = node.callee.name;
      if (!context.allowedFunctions[callee]) {
        throw new Error(`Function "${callee}" is not allowed`);
      }
      func = context.allowedFunctions[callee];
    } else if (node.callee.type === 'ArrowFunctionExpression') {
      func = evaluateArrowFunction(node.callee, context);
    } else {
      throw new Error('Unsupported function call type');
    }

    const args = node.arguments.map(arg => evaluateNode(arg, context));
    return func(...args);
  }

  const expressionStatement = ast.body[0]
  if (!isExpressionStatement(expressionStatement)) {
    throw new Error('Invalid input structure');
  }

  return evaluateNode(expressionStatement.expression, context);
}