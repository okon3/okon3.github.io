# Angular

## Performance

### trackBy

[(Angular.io)](https://angular.io/api/core/TrackByFunction) [(More on this)](https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5)

When using `ngFor` to loop over an array in templates, use it with a `trackBy` function which will return an unique identifier for each item.

When an array changes, Angular re-renders the whole DOM tree. But if you use trackBy, Angular will know which element has changed and will only make DOM changes for that particular element.

**Before**
```html
	<li *ngFor="let item of items;">{{ item }}</li>
```

**After**
```html
// in the template

	<li *ngFor="let item of items; trackBy: trackByFn">{{ item }}</li>

// in the component

	trackByFn(index, item) {    
		return item.id; // unique id corresponding to the item
	}
```

### OnPush ChangeDetection

By default, Angular uses the `ChangeDetectionStrategy.Default` change detection strategy on all components, meaning it will undergo change detection with nearly any user interaction (user event, xhr, promise, etc).

This is not very efficient if you’re already making a distinction between Smart Components and Pure/Dumb Components. In short: unlike a Smart component, a Dumb component is like a pure function. It has 1 or more @Input’s and/or @Output’s, but it doesn’t have any services injected and doesn’t produce any side-effects. This makes the component predictable and testable.

Since the component is Dumb (or Pure) we know it should only be re-rendered if the @Input changes. So let’s tell this to Angular.
We simply add `changeDetection: ChangeDetectionStrategy.OnPush` to the Component Decorater