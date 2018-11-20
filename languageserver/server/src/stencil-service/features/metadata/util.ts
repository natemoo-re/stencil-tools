import * as ts from 'typescript';
import { Range } from 'vscode-languageserver';

export function getComponentOptions(sourceFile: ts.SourceFile): { value: any, range: Range } {
	let options: any = null;
	let range: Range = null;

	function visit(node: ts.Node) {
		if (ts.isClassDeclaration(node) && isComponentClass(node)) {
			const component = node.decorators.filter(isDecoratorNamed('Component'))[0];
			options = getDeclarationParameters<any>(sourceFile, component);
			range = Range.create(ts.getLineAndCharacterOfPosition(sourceFile, component.pos), ts.getLineAndCharacterOfPosition(sourceFile, component.end))
		}
		node.forEachChild(visit);
	}
	visit(sourceFile);
	
	return { value: options[0], range };
}

interface DecoratedMembers {
	props: string[];
	states: string[];
	methods: string[];
	members: string[];
	watched: string[];
}
export function getDecoratedMembers(sourceFile: ts.SourceFile): DecoratedMembers {
	const props: string[] = [];
	const states: string[] = [];
	const methods: string[] = [];
	const members: string[] = [];
	const watched: string[] = [];

	function visit(node: ts.Node) {
		if (ts.isClassDeclaration(node) && isComponentClass(node)) {
			members.push(...node.members.filter(ts.isMethodDeclaration).map(m => ts.isIdentifier(m.name) && m.name.text));
			
			node.members
				.filter(isPropertyWithDecorators)
				.forEach(member => {
					const name = member.name && ts.isIdentifier(member.name) && member.name.text;
					switch (getDecoratorName(member)) {
						case 'Prop': props.push(name);
							break;
						case 'State': states.push(name);
							break;
						default:
							break;
					}
				})
			
			node.members.filter(isMethodWithDecorators)
				.forEach(member => {
					const name = member.name && ts.isIdentifier(member.name) && member.name.text;
					switch (getDecoratorName(member)) {
						case 'Watch':
							const [arg] = getDeclarationParameters(sourceFile, member.decorators[0]);
							if (arg) watched.push(arg);
							break;
					}
				})
		}
		node.forEachChild(visit);
	}
	
	visit(sourceFile);
	return { props, states, methods, members, watched };
}


/**
 * Check if class has component decorator
 * @param classNode
 */
export function isComponentClass(classNode: ts.ClassDeclaration) {
	if (!Array.isArray(classNode.decorators)) {
		return false;
	}
	const componentDecoratorIndex = classNode.decorators.findIndex(dec =>
		(ts.isCallExpression(dec.expression) && ts.isIdentifier(dec.expression.expression) && dec.expression.expression.text === 'Component')
	);
	return (componentDecoratorIndex !== -1);
}

export function isDecoratorNamed(name: string) {
	return (dec: ts.Decorator): boolean => {
		return (ts.isCallExpression(dec.expression) && ts.isIdentifier(dec.expression.expression) && dec.expression.expression.text === name);
	};
}

function getDecoratorName(member: ts.ClassElement): string {
	if (!member.decorators && !Array.isArray(member.decorators)) return null;
	const lastDecorator = member.decorators[member.decorators.length - 1]; 
	return ts.isCallExpression(lastDecorator.expression) && lastDecorator.expression.expression && ts.isIdentifier(lastDecorator.expression.expression) && lastDecorator.expression.expression.text;
}

export function getDecoratorArguments(dec: ts.Decorator) {
	return ts.isCallExpression(dec.expression) ? dec.expression.arguments : null;
}

export function isPropertyWithDecorators(member: ts.ClassElement): boolean {
	return ts.isPropertyDeclaration(member)
		&& Array.isArray(member.decorators)
		&& member.decorators.length > 0;
}

export function isMethod(member: ts.ClassElement, methodName: string) {
	if (ts.isMethodDeclaration(member)) {
		return member.getFirstToken().getText() === methodName;
	}
	return false;
}

export function isMethodWithDecorators(member: ts.ClassElement): boolean {
	return ts.isMethodDeclaration(member)
		&& Array.isArray(member.decorators)
		&& member.decorators.length > 0;
}

export function evalText(text: string) {
	const fnStr = `return ${text};`;
	return new Function(fnStr)();
}

export interface GetDeclarationParameters {
	<T>(sourceFile: ts.SourceFile, decorator: ts.Decorator): [T];
	<T, T1>(sourceFile: ts.SourceFile, decorator: ts.Decorator): [T, T1];
	<T, T1, T2>(sourceFile: ts.SourceFile, decorator: ts.Decorator): [T, T1, T2];
}
export const getDeclarationParameters: GetDeclarationParameters = (sourceFile: ts.SourceFile, decorator: ts.Decorator): any => {
	if (!ts.isCallExpression(decorator.expression)) {
		return [];
	}

	return decorator.expression.arguments.map((arg) => {
		return evalText(arg.getText(sourceFile).trim());
	});
};