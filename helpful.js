/**
 * Helpful - A lightweight, accessible product tour component
 * https://github.com/davemart-in/helpful
 * 
 * @license MIT
 */

(function (window, document) {
	'use strict';

	// Default cursor SVG as base64 data URL
	var DEFAULT_CURSOR_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMiA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuNSAzLjIxTDUuNSAyNy41TDExLjY5ODUgMjEuMzAxNUwxNi41IDMwLjVMMjEuNSAyOEwxNi42OTg1IDE4LjgwMTVMMjUuNSAxOC43OUw1LjUgMy4yMVoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2Zz4K';

	// Tour data configuration
	var data = {
		tours: {
			'single-page': {
				steps: [
					{
						description: 'Welcome! Click [Initialize Process] to start.',
						pointer: { element: '#init-button', action: 'click' }
					},
					{
						description: 'Now click [Configure Settings] to continue.',
						pointer: { element: '#config-button', action: 'click' }
					},
					{
						description: 'Finally, click [Finish Setup] to complete.',
						pointer: { element: '#finish-button', action: 'click' }
					}
				],
				options: {
					showStepNumbers: true,
					resumeKey: 'single-page-tour-progress',
					onComplete: function() {
						alert('Single page tour completed!');
					},
					onSkip: function(lastStep) {
						console.log('Single page tour skipped at step:', lastStep + 1);
					}
				}
			},
			'multi-page': {
				steps: {
					'index.html': [
						{
							description: 'Welcome! Click [Step 1: Profile Setup] to begin.',
							pointer: { element: '#step1-button', action: 'click' }
						},
						{
							description: 'Now click [Step 2: Basic Config] to continue.',
							pointer: { element: '#step2-button', action: 'click' }
						}
					],
					'page-two.html': [
						{
							description: 'Toggle [Enable] here.',
							pointer: { element: '#notifications-toggle' }
						},
						{
							description: 'Click [Complete Setup] to finish.',
							pointer: { element: '#complete-setup', action: 'click' }
						}
					]
				},
				options: {
					showStepNumbers: true,
					resumeKey: 'multipage-tour-progress',
					onComplete: function() {
						alert('Multi-page tour completed!');
						Utils.clearUrlParam();
					},
					onSkip: function(lastStep) {
						console.log('Multi-page tour skipped at step:', lastStep + 1);
						Utils.clearUrlParam();
					}
				}
			}
		}
	};

	// Global shared elements manager - ensures only one set of DOM elements across all tour systems
	window.SharedTourElements = window.SharedTourElements || {
		elements: null,
		refCount: 0,
		
		getInstance: function() {
			if (!this.elements) {
				this.createElement();
			}
			this.refCount++;
			return this.elements;
		},
		
		releaseInstance: function() {
			this.refCount--;
			if (this.refCount <= 0 && this.elements) {
				this.cleanup();
			}
		},
		
		createElement: function() {
			// Create shared modal and overlay elements
			var modal = document.createElement('div');
			modal.className = 'tour-modal';
			modal.innerHTML = Utils.getModalHTML();
			
			var overlay = document.createElement('div');
			overlay.className = 'tour-overlay';
			overlay.innerHTML = Utils.getOverlayHTML(); // Uses default pointerUrl
			
			// Add to DOM
			document.body.appendChild(modal);
			document.body.appendChild(overlay);
			
			// Cache element references
			this.elements = {
				modal: modal,
				overlay: overlay,
				pointer: overlay.querySelector('.tour-pointer'),
				dismiss: modal.querySelector('.tour-dismiss'),
				description: modal.querySelector('.tour-description'),
				stepNumber: modal.querySelector('.tour-step'),
				totalSteps: modal.querySelector('.tour-total')
			};
		},
		
		cleanup: function() {
			if (this.elements) {
				this.elements.modal.remove();
				this.elements.overlay.remove();
				this.elements = null;
			}
			this.refCount = 0;
		}
	};

	// Utility functions
	var Utils = {
		// Clear URL parameters for multi-page tours
		clearUrlParam: function() {
			if (window.history && window.history.replaceState) {
				window.history.replaceState({}, document.title, window.location.pathname);
			}
		},

		// Calculate pointer position with offset
		calculatePointerPosition: function(rect, offsetX, offsetY) {
			return {
				left: (rect.right + (offsetX || 16)) + 'px',
				top: (rect.bottom + (offsetY || 20)) + 'px'
			};
		},

		// Toggle CSS classes efficiently
		toggleClasses: function(element, classes, add) {
			classes.forEach(function(cls) {
				element.classList[add ? 'add' : 'remove'](cls);
			});
		},

		// Get current page name from URL
		getCurrentPageName: function() {
			var path = window.location.pathname;
			var pageName = path.split('/').pop() || 'index.html';
			return pageName === '' ? 'index.html' : pageName;
		},

		// Extract pages from tour configuration
		extractPagesFromTour: function(tourConfig) {
			if (Array.isArray(tourConfig.steps)) {
				// Single-page tour: applies to any page it's set up on
				return null;
			} else {
				// Multi-page tour: extract from steps object keys
				return Object.keys(tourConfig.steps);
			}
		},

		// Shared HTML generation methods
		getModalHTML: function(showStepNumbers) {
			return `
				<div class="tour-content">
					<a href="#" class="button-link tour-dismiss">
						<svg fill="none" height="14" viewBox="0 0 14 14" width="14" xmlns="http://www.w3.org/2000/svg">
							<g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
								<path d="m10.5 3.5-7 7"/>
								<path d="m3.5 3.5 7 7"/>
							</g>
						</svg>
					</a>
					<div class="tour-body">
						${showStepNumbers !== false ? '<div class="tour-header"><span class="tour-step">1</span> of <span class="tour-total">1</span></div>' : ''}
						<p class="tour-description">Step description goes here.</p>
					</div>
				</div>
			`;
		},

		getOverlayHTML: function(pointerUrl) {
			return `
				<div class="tour-pointer">
					<img src="${pointerUrl || DEFAULT_CURSOR_URL}" alt="Cursor pointer" width="32" height="40">
				</div>
			`;
		}
	};

	/**
	 * TourModal Constructor
	 * @param {Object} options - Configuration options
	 * @param {Object} sharedElements - Optional shared DOM elements to reuse
	 */
	function TourModal(options, sharedElements) {
		// Default options
		this.options = Object.assign({
			steps: [],
			onComplete: null,
			onSkip: null,
			onStepChange: null,
			pointerUrl: DEFAULT_CURSOR_URL,
			showStepNumbers: true,
			autoStart: false,
			resumeKey: 'tour-progress',
			clickableClass: 'tour-clickable'
		}, options);

		this.currentStep = 0;
		this.isActive = false;
		this.elements = {};
		this.activeListeners = [];
		this.currentPointerConfig = null;
		this.sharedElements = sharedElements || null;
		
		this.init();
	}

	/**
	 * Initialize the tour
	 */
	TourModal.prototype.init = function() {
		if (this.sharedElements) {
			// Use shared elements
			this.elements = this.sharedElements;
		} else {
			// Create new elements (fallback for standalone usage)
			this.createElements();
		}
		this.attachEventListeners();
		
		if (this.options.autoStart) {
			this.start();
		}
	};

	/**
	 * Create DOM elements (only called when not using shared elements)
	 */
	TourModal.prototype.createElements = function() {
		// Create and configure modal
		var modal = this.createElement('div', 'tour-modal', Utils.getModalHTML(this.options.showStepNumbers));
		var overlay = this.createElement('div', 'tour-overlay', this.getOverlayHTML());
		
		// Add to DOM
		document.body.appendChild(modal);
		document.body.appendChild(overlay);
		
		// Cache element references
		this.cacheElementReferences(modal, overlay);
	};

	// Helper method to create elements
	TourModal.prototype.createElement = function(tag, className, innerHTML) {
		var element = document.createElement(tag);
		element.className = className;
		element.innerHTML = innerHTML;
		return element;
	};

	// Generate overlay HTML with custom pointer URL
	TourModal.prototype.getOverlayHTML = function() {
		return Utils.getOverlayHTML(this.options.pointerUrl);
	};

	// Cache DOM element references
	TourModal.prototype.cacheElementReferences = function(modal, overlay) {
		this.elements = {
			modal: modal,
			overlay: overlay,
			pointer: overlay.querySelector('.tour-pointer'),
			dismiss: modal.querySelector('.tour-dismiss'),
			description: modal.querySelector('.tour-description'),
			stepNumber: modal.querySelector('.tour-step'),
			totalSteps: modal.querySelector('.tour-total')
		};
	};

	/**
	 * Attach event listeners
	 */
	TourModal.prototype.attachEventListeners = function() {
		var self = this;
		
		// Dismiss button
		this.elements.dismiss.addEventListener('click', function(e) {
			e.preventDefault();
			self.skip();
		});
		
		// Keyboard navigation
		document.addEventListener('keydown', function(e) {
			if (!self.isActive) return;
			
			var keyActions = {
				'Escape': function() { self.skip(); },
				'ArrowRight': function() { self.nextStep(); },
				'ArrowLeft': function() { self.previousStep(); }
			};
			
			if (keyActions[e.key]) {
				keyActions[e.key]();
			}
		});
		
		// Update pointer position on scroll/resize
		this.scrollHandler = function() {
			if (self.isActive && self.currentPointerConfig) {
				self.animatePointer(self.currentPointerConfig, { noTransition: true });
			}
		};
		
		window.addEventListener('scroll', this.scrollHandler);
		window.addEventListener('resize', this.scrollHandler);
	};

	/**
	 * Start the tour
	 */
	TourModal.prototype.start = function() {
		if (this.options.steps.length === 0) {
			console.warn('No tour steps defined');
			return;
		}
		
		this.isActive = true;
		this.currentStep = this.loadProgress() || 0;
		
		// Update total steps
		if (this.elements.totalSteps) {
			this.elements.totalSteps.textContent = this.options.steps.length;
		}
		
		// Show/hide step numbers based on options
		var stepHeader = this.elements.modal.querySelector('.tour-header');
		if (stepHeader) {
			stepHeader.style.display = this.options.showStepNumbers ? 'block' : 'none';
		}
		
		// Show modal and overlay
		this.showTourElements();
		this.showStep(this.currentStep);
	};

	// Helper to show tour elements
	TourModal.prototype.showTourElements = function() {
		Utils.toggleClasses(this.elements.modal, ['show'], true);
		Utils.toggleClasses(this.elements.overlay, ['show'], true);
		Utils.toggleClasses(document.body, ['tour-active'], true);
	};

	/**
	 * Show a specific step
	 */
	TourModal.prototype.showStep = function(index) {
		if (index < 0 || index >= this.options.steps.length) return;
		
		var step = this.options.steps[index];
		this.currentStep = index;
		
		// Update step number
		if (this.elements.stepNumber) {
			this.elements.stepNumber.textContent = index + 1;
		}
		
		// Update description with transition
		this.updateStepDescription(step);
	};

	// Handle step description update and animations
	TourModal.prototype.updateStepDescription = function(step) {
		var self = this;
		
		this.elements.description.classList.remove('active');
		
		setTimeout(function() {
			// Process button highlights in description
			var processedDescription = step.description.replace(/\[([^\]]+)\]/g, '<span class="button-highlight">$1</span>');
			self.elements.description.innerHTML = processedDescription;
			Utils.toggleClasses(self.elements.description, ['tour-step-transition', 'active'], true);
			
			self.handleStepPointer(step);
			self.handleClickableElements(step);
			self.setupStepClickHandler(step);
			self.saveProgress(self.currentStep);
			
			// Trigger callback
			if (self.options.onStepChange) {
				self.options.onStepChange(self.currentStep, step);
			}
		}, 150);
	};

	// Handle pointer animation for step
	TourModal.prototype.handleStepPointer = function(step) {
		if (step.pointer) {
			this.currentPointerConfig = step.pointer;
			this.animatePointer(step.pointer);
			
			if (step.pointer.element) {
				this.scrollToElement(step.pointer.element);
			}
		}
	};

	// Handle clickable element highlighting
	TourModal.prototype.handleClickableElements = function(step) {
		var clickableSelector = step.pointer && step.pointer.element;
		if (clickableSelector) {
			this.highlightClickable(clickableSelector);
		}
	};

	/**
	 * Animate pointer to a position
	 */
	TourModal.prototype.animatePointer = function(config, options) {
		var pointer = this.elements.pointer;
		options = options || {};
		
		// Handle click animation
		if (config.action === 'click') {
			pointer.classList.add('clicking');
			setTimeout(function() { pointer.classList.remove('clicking'); }, 800);
		}
		
		// Position pointer
		this.positionPointer(config, options);
		
		// Handle enlarged state
		Utils.toggleClasses(pointer, ['enlarged'], config.enlarged);
	};

	// Extract pointer positioning logic
	TourModal.prototype.positionPointer = function(config, options) {
		var pointer = this.elements.pointer;
		
		// Toggle moving class based on transition preference
		Utils.toggleClasses(pointer, ['moving'], !options.noTransition);
		
		var position;
		if (config.element) {
			var targetElement = document.querySelector(config.element);
			if (targetElement) {
				var rect = targetElement.getBoundingClientRect();
				position = Utils.calculatePointerPosition(rect);
			}
		} else if (config.x !== undefined && config.y !== undefined) {
			position = Utils.calculatePointerPosition({ right: config.x, bottom: config.y }, 0, 0);
		}
		
		if (position) {
			pointer.style.left = position.left;
			pointer.style.top = position.top;
		}
	};

	/**
	 * Scroll to target element if it's not fully visible (including pointer space)
	 */
	TourModal.prototype.scrollToElement = function(selector) {
		var targetElement = document.querySelector(selector);
		if (!targetElement) return;
		
		var rect = targetElement.getBoundingClientRect();
		
		// Account for pointer dimensions and offset
		var pointerWidth = 32;  // From SVG width
		var pointerHeight = 40; // From SVG height
		var pointerOffsetX = 16; // Default offset from calculatePointerPosition
		var pointerOffsetY = 20; // Default offset from calculatePointerPosition
		
		// Calculate the space needed for both element and pointer
		var pointerRight = rect.right + pointerOffsetX + pointerWidth;
		var pointerBottom = rect.bottom + pointerOffsetY + pointerHeight;
		
		var isFullyVisible = (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= window.innerHeight &&
			rect.right <= window.innerWidth &&
			pointerRight <= window.innerWidth &&
			pointerBottom <= window.innerHeight
		);
		
		if (!isFullyVisible) {
			this.smoothScrollToElement(targetElement);
		}
	};

	/**
	 * Custom smooth scrolling with controlled duration
	 */
	TourModal.prototype.smoothScrollToElement = function(targetElement) {
		var rect = targetElement.getBoundingClientRect();
		var currentScrollX = window.pageXOffset;
		var currentScrollY = window.pageYOffset;
		
		// Calculate target position (center the element)
		var targetX = currentScrollX + rect.left - (window.innerWidth / 2) + (rect.width / 2);
		var targetY = currentScrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
		
		// Constrain to valid scroll bounds
		var maxScrollX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
		var maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		
		targetX = Math.max(0, Math.min(targetX, maxScrollX));
		targetY = Math.max(0, Math.min(targetY, maxScrollY));
		
		var startX = currentScrollX;
		var startY = currentScrollY;
		var distanceX = targetX - startX;
		var distanceY = targetY - startY;
		
		var duration = 800; // Slower, more comfortable duration (was default ~300ms)
		var startTime = null;
		
		function easeOutCubic(t) {
			return 1 - Math.pow(1 - t, 3);
		}
		
		function animateScroll(currentTime) {
			if (startTime === null) startTime = currentTime;
			var timeElapsed = currentTime - startTime;
			var progress = Math.min(timeElapsed / duration, 1);
			
			var ease = easeOutCubic(progress);
			var currentX = startX + (distanceX * ease);
			var currentY = startY + (distanceY * ease);
			
			window.scrollTo(currentX, currentY);
			
			if (progress < 1) {
				requestAnimationFrame(animateScroll);
			}
		}
		
		requestAnimationFrame(animateScroll);
	};

	/**
	 * Setup automatic click handler for step advancement
	 */
	TourModal.prototype.setupStepClickHandler = function(step) {
		var self = this;
		
		this.cleanupStepClickHandlers();
		
		var targetSelector = step.pointer && step.pointer.element;
		if (targetSelector) {
			var targetElement = document.querySelector(targetSelector);
			if (targetElement) {
				var clickHandler = function() {
					if (self.isActive) {
						setTimeout(function() { self.nextStep(); }, 200);
					}
				};
				
				targetElement.addEventListener('click', clickHandler);
				this.activeListeners.push({ element: targetElement, handler: clickHandler });
			}
		}
	};

	/**
	 * Clean up step click handlers
	 */
	TourModal.prototype.cleanupStepClickHandlers = function() {
		this.activeListeners.forEach(function(listener) {
			listener.element.removeEventListener('click', listener.handler);
		});
		this.activeListeners = [];
	};

	/**
	 * Highlight clickable elements
	 */
	TourModal.prototype.highlightClickable = function(selector) {
		var self = this;
		
		// Remove previous highlights
		document.querySelectorAll('.' + this.options.clickableClass).forEach(function(el) {
			el.classList.remove(self.options.clickableClass);
		});
		
		// Add new highlights
		if (selector) {
			document.querySelectorAll(selector).forEach(function(el) {
				el.classList.add(self.options.clickableClass);
			});
		}
	};

	/**
	 * Navigation methods
	 */
	TourModal.prototype.nextStep = function() {
		if (this.currentStep < this.options.steps.length - 1) {
			this.showStep(this.currentStep + 1);
		} else {
			this.complete();
		}
	};

	TourModal.prototype.previousStep = function() {
		if (this.currentStep > 0) {
			this.showStep(this.currentStep - 1);
		}
	};

	TourModal.prototype.skip = function() {
		this.cleanup();
		this.clearProgress();
		this.currentStep = 0;
		if (this.options.onSkip) {
			this.options.onSkip(this.currentStep);
		}
	};

	TourModal.prototype.complete = function() {
		this.cleanup();
		this.clearProgress();
		if (this.options.onComplete) {
			this.options.onComplete();
		}
	};

	/**
	 * Clean up tour elements
	 */
	TourModal.prototype.cleanup = function() {
		this.isActive = false;
		this.currentPointerConfig = null;
		
		// Hide elements
		Utils.toggleClasses(this.elements.modal, ['show'], false);
		Utils.toggleClasses(this.elements.overlay, ['show'], false);
		Utils.toggleClasses(document.body, ['tour-active'], false);
		
		// Remove highlights and clean up handlers
		this.highlightClickable(null);
		this.cleanupStepClickHandlers();
	};

	/**
	 * Progress management
	 */
	TourModal.prototype.saveProgress = function(step) {
		if (this.options.resumeKey) {
			localStorage.setItem(this.options.resumeKey, step);
		}
	};

	TourModal.prototype.loadProgress = function() {
		if (this.options.resumeKey) {
			var saved = localStorage.getItem(this.options.resumeKey);
			return saved !== null ? parseInt(saved, 10) : null;
		}
		return null;
	};

	TourModal.prototype.clearProgress = function() {
		if (this.options.resumeKey) {
			localStorage.removeItem(this.options.resumeKey);
		}
	};

	/**
	 * Destroy the tour instance
	 */
	TourModal.prototype.destroy = function() {
		this.cleanup();
		
		// Remove event listeners
		if (this.scrollHandler) {
			window.removeEventListener('scroll', this.scrollHandler);
			window.removeEventListener('resize', this.scrollHandler);
		}
		
		// Only remove DOM elements if not using shared elements
		if (!this.sharedElements) {
			this.elements.modal.remove();
			this.elements.overlay.remove();
		} else {
			// Release reference to shared elements
			window.SharedTourElements.releaseInstance();
		}
	};

	/**
	 * Update pointer image source (useful for shared elements)
	 */
	TourModal.prototype.updatePointerImage = function(src) {
		var img = this.elements.pointer.querySelector('img');
		if (img && src) {
			img.src = src;
		}
	};

	// Export to window
	window.TourModal = TourModal;

	// Auto-initialization manager
	var TourManager = {
		tourConfigs: {},
		cursorDataUrl: null,
		activeTour: null,
		
		init: function() {
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', this.setupTours.bind(this));
			} else {
				this.setupTours();
			}
		},
		
		createCursorDataUrl: function() {
			// Define cursor SVG directly in JavaScript
			var cursorSvgString = '<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
				'<path d="M5.5 3.21L5.5 27.5L11.6985 21.3015L16.5 30.5L21.5 28L16.6985 18.8015L25.5 18.79L5.5 3.21Z" fill="white" stroke="black" stroke-width="2"/>' +
				'</svg>';
			this.cursorDataUrl = 'data:image/svg+xml;base64,' + btoa(cursorSvgString);
		},
		
		setupTours: function() {
			this.createCursorDataUrl();
			
			var currentPage = Utils.getCurrentPageName();
			
			// Handle multi-page tour continuation
			var urlParams = new URLSearchParams(window.location.search);
			if (urlParams.get('tour') === 'multipage' && currentPage === 'page-two.html') {
				this.startMultiPageContinuation();
				return;
			}
			
			// Store tour configurations for later use
			this.setupTourConfigs(currentPage);
		},
		
		setupTourConfigs: function(currentPage) {
			for (var tourId in data.tours) {
				var tourConfig = data.tours[tourId];
				var tourPages = Utils.extractPagesFromTour(tourConfig);
				
				// For single-page tours (tourPages is null), set up on current page
				// For multi-page tours, check if current page is in the extracted pages
				if (tourPages === null || tourPages.indexOf(currentPage) !== -1) {
					this.setupTourConfig(tourId, tourConfig, currentPage);
				}
			}
		},
		
		setupTourConfig: function(tourId, tourConfig, currentPage) {
			var steps = Array.isArray(tourConfig.steps) 
				? tourConfig.steps 
				: tourConfig.steps[currentPage] || [];
			
			if (steps.length === 0) return;
			
			// Store the configuration for when the tour is started
			this.tourConfigs[tourId] = {
				steps: steps,
				options: tourConfig.options,
				currentPage: currentPage
			};
			
			this.setupStartButton(tourId);
		},
		
		startTour: function(tourId) {
			// Stop any active tour first
			if (this.activeTour) {
				this.activeTour.destroy();
				this.activeTour = null;
			}
			
			var config = this.tourConfigs[tourId];
			if (!config) {
				console.warn('Tour configuration not found:', tourId);
				return;
			}
			
			var options = Object.assign({}, config.options, {
				steps: config.steps,
				pointerUrl: this.cursorDataUrl
			});
			
			// Handle multi-page tour navigation
			if (tourId === 'multi-page' && config.currentPage === 'index.html') {
				options.onComplete = function() {
					window.location.href = 'page-two.html?tour=multipage';
				};
			}
			
			// Get shared elements from global manager
			var sharedElements = window.SharedTourElements.getInstance();
			
			// Create and start tour with shared elements
			this.activeTour = new TourModal(options, sharedElements);
			
			// Update pointer image if we have a cursor data URL
			if (this.cursorDataUrl) {
				this.activeTour.updatePointerImage(this.cursorDataUrl);
			}
			
			this.activeTour.start();
		},
		
		setupStartButton: function(tourId) {
			var self = this;
			var startButton = document.getElementById('start-' + tourId + '-tour');
			if (startButton) {
				startButton.addEventListener('click', function() {
					self.startTour(tourId);
				});
			}
		},
		
		startMultiPageContinuation: function() {
			var tourConfig = data.tours['multi-page'];
			var steps = tourConfig.steps['page-two.html'] || [];
			
			if (steps.length === 0) return;
			
			var options = Object.assign({}, tourConfig.options, {
				steps: steps,
				pointerUrl: this.cursorDataUrl
			});
			
			// Get shared elements from global manager
			var sharedElements = window.SharedTourElements.getInstance();
			
			// Create tour with shared elements
			this.activeTour = new TourModal(options, sharedElements);
			
			// Update pointer image if we have a cursor data URL
			if (this.cursorDataUrl) {
				this.activeTour.updatePointerImage(this.cursorDataUrl);
			}
			
			this.setupCenterPointerStart(this.activeTour);
			
			setTimeout(function() { 
				TourManager.activeTour.start(); 
			}, 100);
		},
		
		setupCenterPointerStart: function(tour) {
			var originalShowStep = tour.showStep.bind(tour);
			var isFirstStep = true;
			
			tour.showStep = function(index) {
				if (isFirstStep && index === 0) {
					tour.showTourElements();
					
					// Center the pointer initially
					var pointer = tour.elements.pointer;
					var centerX = window.innerWidth / 2;
					var centerY = window.innerHeight / 2;
					
					pointer.classList.remove('moving');
					pointer.style.left = (centerX - 16) + 'px';
					pointer.style.top = (centerY - 20) + 'px';
					
					// Show step content
					var step = tour.options.steps[index];
					tour.currentStep = index;
					
					if (tour.elements.stepNumber) {
						tour.elements.stepNumber.textContent = index + 1;
					}
					
					// Process button highlights in description
					var processedDescription = step.description.replace(/\[([^\]]+)\]/g, '<span class="button-highlight">$1</span>');
					tour.elements.description.innerHTML = processedDescription;
					Utils.toggleClasses(tour.elements.description, ['tour-step-transition', 'active'], true);
					
					// Animate to target after delay
					setTimeout(function() {
						tour.handleStepPointer(step);
						tour.handleClickableElements(step);
						tour.setupStepClickHandler(step);
						tour.saveProgress(index);
						
						if (tour.options.onStepChange) {
							tour.options.onStepChange(index, step);
						}
					}, 600);
					
					isFirstStep = false;
				} else {
					originalShowStep(index);
				}
			};
		}

	};
	
	// Initialize when script loads
	TourManager.init();

})(window, document);