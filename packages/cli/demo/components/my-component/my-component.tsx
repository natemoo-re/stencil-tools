import { Component } from '@stencil/core';

@Component({
  tag: 'x-my-component',
  styleUrl: 'my-component.scss',
  shadow: true
})
export class MyComponent {

  render() {
    return (
      <div>
        <p>Hello <code>x-my-component</code></p>
      </div>
    );
  }
}
