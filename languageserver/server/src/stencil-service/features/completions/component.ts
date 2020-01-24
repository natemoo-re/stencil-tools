import { CompletionItem, MarkupKind, InsertTextFormat, CompletionItemKind } from 'vscode-languageserver';
import { flatten } from './util';

export const LIFECYCLE_METHODS: CompletionItem[] = [
	{
		label: 'componentWillLoad',
		description: [
			"The component is about to load and it has not rendered yet.\n",
			"This is the best place to make any data updates before the first render.\n",
			"`componentWillLoad` will only be called once."
		],
		insertText: [
			"componentWillLoad() {",
			"\t${1:console.log('Component is about to be rendered');}$0",
			"}"
		]
	},
	{
		label: 'componentDidLoad',
		description: [
			"The component has loaded and has already rendered.\n",
			"Updating data in this method will cause the component to re-render.\n",
			"`componentDidLoad` will only be called once."
		],
		insertText: [
			"componentDidLoad() {",
			"\t${1:console.log('Component has been rendered');}$0",
			"}"
		]
	},
	{
		label: 'componentWillUpdate',
		description: [
			"The component is about to update and re-render.\n",
			"Called multiple times throughout the life of the component as it updates.\n",
			"`componentWillUpdate` is not called on the first render."
		],
		insertText: [
			"componentWillUpdate() {",
			"\t${1:console.log('Component will update and re-render');}$0",
			"}"
		]
	},
	{
		label: 'componentDidUpdate',
		description: [
			"The component has updated and re-rendered.\n",
			"Called multiple times throughout the life of the component as it updates.\n",
			"`componentDidUpdate` is not called on the first render."
		],
		insertText: [
			"componentDidUpdate() {",
			"\t${1:console.log('Component did update');}$0",
			"}"
		]
	},
	{
		label: 'componentDidUnload',
		description: [
			"The component did unload and the element will be destroyed."
		],
		insertText: [
			"componentDidUnload() {",
			"\t${1:console.log('Component removed from the DOM');}$0",
			"}"
		]
	}
].map((item) => {
	return {
		label: item.label,
		detail: `Stencil: Component Lifecycle Method\n${item.label}`,
		kind: CompletionItemKind.Method,
		documentation: {
			kind: MarkupKind.Markdown,
			value: flatten(item.description)
		},
		insertText: flatten(item.insertText),
		insertTextFormat: InsertTextFormat.Snippet,
		data: {
			resolve: false,
			isFilterable: true
		}
	}
});

export const METHODS: CompletionItem[] = [
	{
		label: 'render',
		description: 'The `render()` method is required in order to render the component.',
		insertText: [
			"render() {",
			"\treturn (",
			"\t\t<div>",
			"\t\t\t${1:<p>Hello <code>%componentTag%</code></p>}$0",
			"\t\t</div>",
			"\t);",
			"}"
		],
		preview: [
			"render() {",
			"\treturn (",
			"\t\t<div>",
			"\t\t\t<p>Hello <code>%componentTag%</code></p>",
			"\t\t</div>",
			"\t);",
			"}"
		]
	}
].map((item) => {
	const resolve = (item.label === 'render');
	const hasPlaceholders = (item.label === 'render');
	return {
		label: item.label,
		detail: `Stencil: Component Method\n${item.label}`,
		kind: CompletionItemKind.Method,
		documentation: {
			kind: MarkupKind.Markdown,
			value: flatten(item.description) + flatten([
				'\n',
				'```tsx',
				flatten(item.preview),
				'```'
			])
		},
		insertText: flatten(item.insertText),
		insertTextFormat: InsertTextFormat.Snippet,
		data: {
			resolve,
			hasPlaceholders,
			isFilterable: true
		}
	}
});

export const DECORATORS: CompletionItem[] = [
	{
		label: 'Prop',
		description: 'The `@Prop()` decorator exposes custom attribute/properties publicly on the element, so that developers can provide values to the component.',
		insertText: "@Prop(${3|{ mutable: true },{ reflect: true }|}) ${1:propName}: ${2|any,string,boolean,number|};",
		preview: "@Prop({ mutable: true }) propName: any;",
		autoImport: 'Prop'
	},
	{
		label: 'Watch',
		description: "When a user updates a property, `@Watch()` will fire what ever method it's attached to and pass that methd the new value of the prop along with the old value.",
		insertText: [
			"@Watch('${1%computedProps%}')",
			"${1}Changed(newValue: ${2|any,string,boolean,number|}, oldValue: $2) {",
			"\t${3:console.log('$1 changed to ', this.$1);}$0",
			"}"
		],
		preview: [
			"@Watch('propName')",
			"propNameChanged(newValue, oldValue) {",
			"\tconsole.log('propName changed to ', this.propName);",
			"}"
		],
		autoImport: 'Watch'
	},
	{
		label: 'State',
		description: "The `@State()` decorator can be used to manage internal data for a component. Any changes to a `@State()` property will cause the components render function to be called again.",
		insertText: "@State() ${1:stateName} = ${2:'value'};",
		preview: "@State() stateName = 'value'",
		autoImport: 'State'
	},
	{
		label: 'Method',
		description: "The `@Method()` decorator is used to expose methods on the public API. Functions decorated with the `@Method()` decorator can be called directly from the element.",
		insertText: [
			"@Method()",
			"${1:methodName}($2) {",
			"\t$0",
			"}"
		],
		preview: [
			"@Method()",
			"methodName() {",
			"\t",
			"}"
		],
		autoImport: 'Method'
	},
	{
		label: 'Element',
		description: "The `@Element()` decorator is how to get access to the host element within the class instance. This returns an instance of `HTMLElement`, so standard DOM methods/events can be used here.",
		insertText: "@Element() ${1:element}!: HTMLElement;",
		preview: "@Element() element!: HTMLElement;",
		autoImport: 'Element'
	},
	{
		label: 'Event',
		insertText: "@Event() ${1:eventName}!: EventEmitter<${2:any}>;",
		preview: "@Event() eventName: EventEmitter<any>;",
		description: "The `@Event()` decorator allows a Component to dispatch Custom DOM events for other components to handle.",
		autoImport: 'Event, EventEmitter'
	},
	{
		label: 'Listen (decorator only)',
		description: "The `Listen()` decorator is for handling events dispatched from @Events.",
		insertText: "@Listen('${1|body,child,document,keydown,parent,window|}')",
		preview: "@Listen('eventName')",
		autoImport: 'Listen'
	},
	{
		label: 'Listen',
		description: "The `Listen()` decorator is for handling events dispatched from @Events.",
		insertText: [
			"@Listen('${1|body,child,document,keydown,parent,window|}')",
			"protected ${2:$1Handler}(event) {",
			"\t${3:console.log('Received the \"$1\" event: ', event);}$0",
			"}"
		],
		preview: [
			"@Listen('eventName')",
			"protected eventNameHandler(event) {",
			"\tconsole.log('Received the \"$1\" event: ', event);",
			"}"
		],
		autoImport: 'Listen'
	}
].map((item) => {
	const { label } = item; 
	const hasPlaceholders = (item.label === 'Watch');
	const detail = label === 'Listen (decorator only)' ? `Stencil: @Listen() Decorator\nAuto import from '@stencil/core'` : `Stencil: @${item.label}() Decorator\nAuto import from '@stencil/core'`;
	return {
		label,
		detail,
		kind: CompletionItemKind.Function,
		documentation: {
			kind: MarkupKind.Markdown,
			value: flatten(item.description) + flatten([
				'\n',
				'```tsx',
				flatten(item.preview),
				'```'
			])
		},
		insertText: flatten(item.insertText),
		insertTextFormat: InsertTextFormat.Snippet,
		data: {
			resolve: true,
			hasPlaceholders,
			isFilterable: false,
			autoImport: item.autoImport
		}
	}
});
