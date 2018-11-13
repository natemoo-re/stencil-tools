const ELEMENT_REF_PREFIXES = [
	'body', 'child', 'document', 'parent', 'window'
];
export const PREFIXES = [
	...ELEMENT_REF_PREFIXES,
	'keydown'
];

export const KEYCODE_SUFFIX = [
	'enter', 'escape', 'space', 'tab', 'up', 'right', 'down', 'left'
];

export const DOM_EVENT_MAP = {
	'abort': 'UIEvent',
	'activate': 'Event',
	'animationcancel': 'AnimationEvent',
	'animationend': 'AnimationEvent',
	'animationiteration': 'AnimationEvent',
	'animationstart': 'AnimationEvent',
	'beforeactivate': 'Event',
	'beforedeactivate': 'Event',
	'blur': 'FocusEvent',
	'canplay': 'Event',
	'canplaythrough': 'Event',
	'change': 'Event',
	'click': 'MouseEvent',
	'contextmenu': 'PointerEvent',
	'dblclick': 'MouseEvent',
	'deactivate': 'Event',
	'drag': 'DragEvent',
	'dragend': 'DragEvent',
	'dragenter': 'DragEvent',
	'dragleave': 'DragEvent',
	'dragover': 'DragEvent',
	'dragstart': 'DragEvent',
	'drop': 'DragEvent',
	'durationchange': 'Event',
	'emptied': 'Event',
	'ended': 'Event',
	'error': 'ErrorEvent',
	'focus': 'FocusEvent',
	'fullscreenchange': 'Event',
	'fullscreenerror': 'Event',
	'gotpointercapture': 'PointerEvent',
	'input': 'Event',
	'invalid': 'Event',
	'keydown': 'KeyboardEvent',
	'keypress': 'KeyboardEvent',
	'keyup': 'KeyboardEvent',
	'load': 'Event',
	'loadeddata': 'Event',
	'loadedmetadata': 'Event',
	'loadstart': 'Event',
	'lostpointercapture': 'PointerEvent',
	'mousedown': 'MouseEvent',
	'mousemove': 'MouseEvent',
	'mouseout': 'MouseEvent',
	'mouseover': 'MouseEvent',
	'mouseup': 'MouseEvent',
	'mousewheel': 'WheelEvent',
	'MSContentZoom': 'Event',
	'MSGestureChange': 'Event',
	'MSGestureDoubleTap': 'Event',
	'MSGestureEnd': 'Event',
	'MSGestureHold': 'Event',
	'MSGestureStart': 'Event',
	'MSGestureTap': 'Event',
	'MSInertiaStart': 'Event',
	'MSManipulationStateChanged': 'Event',
	'MSPointerCancel': 'Event',
	'MSPointerDown': 'Event',
	'MSPointerEnter': 'Event',
	'MSPointerLeave': 'Event',
	'MSPointerMove': 'Event',
	'MSPointerOut': 'Event',
	'MSPointerOver': 'Event',
	'MSPointerUp': 'Event',
	'mssitemodejumplistitemremoved': 'Event',
	'msthumbnailclick': 'Event',
	'pause': 'Event',
	'play': 'Event',
	'playing': 'Event',
	'pointercancel': 'PointerEvent',
	'pointerdown': 'PointerEvent',
	'pointerenter': 'PointerEvent',
	'pointerleave': 'PointerEvent',
	'pointerlockchange': 'Event',
	'pointerlockerror': 'Event',
	'pointermove': 'PointerEvent',
	'pointerout': 'PointerEvent',
	'pointerover': 'PointerEvent',
	'pointerup': 'PointerEvent',
	'progress': 'ProgressEvent',
	'ratechange': 'Event',
	'readystatechange': 'Event',
	'reset': 'Event',
	'scroll': 'UIEvent',
	'seeked': 'Event',
	'seeking': 'Event',
	'select': 'UIEvent',
	'selectionchange': 'Event',
	'selectstart': 'Event',
	'stalled': 'Event',
	'stop': 'Event',
	'submit': 'Event',
	'suspend': 'Event',
	'timeupdate': 'Event',
	'touchcancel': 'TouchEvent',
	'touchend': 'TouchEvent',
	'touchmove': 'TouchEvent',
	'touchstart': 'TouchEvent',
	'transitioncancel': 'TransitionEvent',
	'transitionend': 'TransitionEvent',
	'transitionrun': 'TransitionEvent',
	'transitionstart': 'TransitionEvent',
	'volumechange': 'Event',
	'waiting': 'Event',
	'webkitfullscreenchange': 'Event',
	'webkitfullscreenerror': 'Event',
	'wheel': 'WheelEvent'
}

export const DOM_EVENT_SUFFIX = Object.keys(DOM_EVENT_MAP);
export function getDOMEventType(eventName: string): string {
	return (DOM_EVENT_MAP as any)[eventName];
}

export function isElementRefPrefix(eventName: string) {
	let splt = eventName.split(':');

	if (splt.length > 2) {
		return false;
	} else if (splt.length > 1) {
		const prefix = splt[0].toLowerCase().trim();
		return (ELEMENT_REF_PREFIXES.indexOf(prefix) > -1);
	} else {
		return false;
	}

}