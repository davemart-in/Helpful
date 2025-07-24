# Helpful

A lightweight, accessible, and customizable product tour library for web applications. Perfect for onboarding new users, showcasing features, or providing contextual help across single or multiple pages.

## Features

- **Lightweight**: Pure CSS & JavaScript with no other dependencies
- **Configuration-Based**: Define tours in a simple data structure
- **Multi-Page Support**: Seamlessly continue tours across page navigations
- **Auto-Initialization**: Tours set up automatically on page load
- **Shared Resources**: Efficient DOM element reuse across multiple tours
- **Responsive**: Works great on mobile and desktop
- **Accessible**: Keyboard navigation and ARIA support
- **Progress Tracking**: Saves user progress with localStorage
- **Smooth Animations**: Transitions and pointer animations baked in

## Installation

1. Download the following files:
   - `helpful.js`
   - `helpful.css`

2. Include them in your HTML:

```html
<link rel="stylesheet" href="path/to/helpful.css">
<script src="path/to/helpful.js"></script>
```

The library will automatically initialize when the DOM is ready.

## Demo

Check out the demo to see it in action.

## Tour Configuration

Tours are configured in the `data.tours` object within helpful.js. Here's the structure:

```javascript
var data = {
    tours: {
        'tour-id': {
            steps: [
                // Single-page tour: array of step objects
            ],
            // OR
            steps: {
                // Multi-page tour: object with page names as keys
                'index.html': [...],
                'page-two.html': [...]
            },
            options: {
                showStepNumbers: true,
                resumeKey: 'tour-progress-key',
                onComplete: function() { /* callback */ },
                onSkip: function(lastStep) { /* callback */ }
            }
        }
    }
};
```

## Step Object Properties

Each step can have these properties:

```javascript
{
    description: 'HTML content for the step (supports [button highlights])',
    pointer: {
        element: '#target-selector',  // CSS selector for target element
        action: 'click',              // Optional: 'click' for click animation
        enlarged: true                // Optional: make pointer larger
    }
}
```

### Direct API Usage

You can also create tours programmatically using the TourModal class:

```javascript
var tour = new TourModal({
    steps: [
        {
            description: 'Welcome! Click [Start] to begin.',
            pointer: { element: '#start-button', action: 'click' }
        }
    ],
    onComplete: function() {
        alert('Tour completed!');
    }
});

tour.start();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `steps` | Array/Object | `[]` | Tour steps (array for single-page, object for multi-page) |
| `showStepNumbers` | Boolean | `true` | Show step numbers (e.g., "1 of 5") |
| `resumeKey` | String | `'tour-progress'` | localStorage key for progress |
| `onComplete` | Function | `null` | Callback when tour is completed |
| `onSkip` | Function | `null` | Callback when tour is skipped |
| `onStepChange` | Function | `null` | Callback when step changes |

## API Methods (TourModal Class)

### `tour.start()`
Start or resume the tour.

### `tour.nextStep()`
Go to the next step.

### `tour.previousStep()`
Go to the previous step.

### `tour.showStep(index)`
Jump to a specific step.

### `tour.skip()`
Skip the tour (triggers `onSkip` callback).

### `tour.complete()`
Complete the tour (triggers `onComplete` callback).

### `tour.destroy()`
Remove the tour and clean up resources.

## Keyboard Shortcuts

- **→** (Right Arrow): Next step
- **←** (Left Arrow): Previous step  
- **Esc**: Skip tour

## Features

### Automatic Scrolling
The library automatically scrolls to keep both the target element and pointer visible on screen.

### Button Highlighting
Use `[Button Text]` in step descriptions to automatically highlight button names.

### Multi-Page Continuation
Tours automatically continue across page navigations using URL parameters.

### Shared Elements
Multiple tours efficiently share DOM elements to improve performance.

### Built-in Cursor
The pointer cursor is included as a data URL - no external SVG file needed.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT License - feel free to use in personal and commercial projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

If you find this library useful, please consider giving it a star on GitHub!