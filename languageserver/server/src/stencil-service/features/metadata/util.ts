import * as ts from 'typescript';

interface DecoratedMembers {
	props: string[];
	states: string[];
	watched: string[];
	methods: string[];
	members: string[];
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
						case 'Watch':
							const arg = getDecoratorArguments(member.decorators[0])[0];
							if (arg && ts.isStringLiteral(arg)) watched.push(arg.text);
							break;
						default:
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