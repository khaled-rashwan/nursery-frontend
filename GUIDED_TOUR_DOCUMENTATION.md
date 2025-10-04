# Guided Tour Implementation Documentation

## Overview
This document describes the implementation of an interactive guided tour for the admin panel using Intro.js library. The tour provides step-by-step tooltips to help new users navigate the main features of the dashboard.

## Features Implemented

### 1. Interactive Guided Tour
- **Library**: Intro.js (v8.3.2)
- **Trigger**: Automatically shows on first visit
- **Persistence**: Uses localStorage to track if tour has been shown
- **Manual Restart**: "Start Tour" button in the dashboard header

### 2. Localization Support
The tour fully supports both English and Arabic languages:

#### Arabic Labels (ar-SA)
- **التالي** - Next
- **السابق** - Previous
- **تخطي** - Skip
- **إنهاء** - Done

#### English Labels (en-US)
- **Next** - Next step
- **Previous** - Previous step
- **Skip** - Skip tour
- **Done** - Finish tour

### 3. Right-to-Left (RTL) Support
- Custom CSS classes for RTL layout
- Proper text direction for Arabic tooltips
- Button alignment adjusted for RTL reading

## Implementation Details

### Files Created/Modified

#### 1. `/src/hooks/useGuidedTour.ts`
Custom React hook for managing the guided tour:
- **Purpose**: Encapsulates tour logic and state management
- **Features**:
  - Automatic initialization on first visit
  - localStorage integration for persistence
  - RTL support for Arabic
  - Cleanup on unmount
  - Manual tour restart functionality

**Key Methods**:
- `startTour()`: Initializes and starts the tour
- `resetTour()`: Clears localStorage and restarts the tour

**Options**:
```typescript
interface GuidedTourOptions {
  tourKey: string;      // Unique key for localStorage
  locale: string;       // Current locale (ar-SA or en-US)
  steps: Array<...>;    // Tour steps configuration
  onComplete?: () => void; // Optional callback on completion
}
```

#### 2. `/src/styles/guided-tour.css`
Custom styling for the tour:
- RTL-specific styles (`.introjs-rtl` classes)
- Enhanced tooltip appearance
- Button styling with gradients and hover effects
- Progress bar and bullet point customization
- Overlay opacity adjustment

#### 3. `/src/app/[locale]/admin/components/dashboard/AdminDashboard.tsx`
Integration of the guided tour in the admin dashboard:
- Import of `useGuidedTour` hook
- Import of intro.js styles
- Tour configuration with 5 steps
- "Start Tour" button in the header

### Tour Steps

The guided tour includes the following steps:

1. **Welcome Message**
   - General introduction to the admin dashboard
   - No specific element targeted
   
2. **Dashboard Header** (`.admin-dashboard-header`)
   - Explains profile information and quick settings
   - Position: bottom
   
3. **Menu Cards Container** (`.admin-menu-cards`)
   - Introduces the main navigation sections
   - Position: bottom
   
4. **Individual Menu Card** (`.admin-menu-card-item`)
   - Describes each section card
   - Position: bottom
   
5. **Closing Message**
   - Reminds user about the "Start Tour" button
   - No specific element targeted

## Usage

### For Users
1. **First Visit**: The tour starts automatically after 500ms delay (to ensure DOM is ready)
2. **Navigation**: Use the arrow buttons or keyboard shortcuts
3. **Skip Tour**: Click the "Skip" button to exit early
4. **Complete Tour**: Click through all steps and finish with "Done"
5. **Restart Tour**: Click the "Start Tour" button (🎯) in the dashboard header anytime

### For Developers

#### Adding a New Tour
```typescript
import { useGuidedTour } from '../path/to/hooks/useGuidedTour';

const { resetTour } = useGuidedTour({
  tourKey: 'my-custom-tour',
  locale: locale,
  steps: [
    {
      intro: 'Welcome message'
    },
    {
      element: '.my-element',
      intro: 'This is my element',
      position: 'bottom'
    }
  ]
});

// Add a button to restart the tour
<button onClick={resetTour}>Start Tour</button>
```

#### Adding More Steps
To add more steps to the existing tour, modify the `steps` array in `AdminDashboard.tsx`:

```typescript
const { resetTour } = useGuidedTour({
  tourKey: 'admin-dashboard-tour',
  locale,
  steps: [
    // ... existing steps
    {
      element: '.new-element',
      intro: isArabic 
        ? 'وصف العنصر بالعربية'
        : 'Element description in English',
      position: 'right'
    }
  ]
});
```

## localStorage Behavior

### Keys Used
- **Key**: `admin-dashboard-tour`
- **Values**:
  - `null`: Tour has not been shown (will run automatically)
  - `'completed'`: User completed the tour
  - `'skipped'`: User skipped the tour

### Persistence Logic
```javascript
// Check if tour should run
const tourCompleted = localStorage.getItem('admin-dashboard-tour');
if (!tourCompleted) {
  // Run the tour
}

// On completion
localStorage.setItem('admin-dashboard-tour', 'completed');

// On skip
localStorage.setItem('admin-dashboard-tour', 'skipped');

// On manual restart
localStorage.removeItem('admin-dashboard-tour');
```

## Configuration Options

The tour can be customized via the intro.js options in `useGuidedTour.ts`:

```typescript
intro.setOptions({
  nextLabel: isArabic ? 'التالي' : 'Next',
  prevLabel: isArabic ? 'السابق' : 'Previous',
  skipLabel: isArabic ? 'تخطي' : 'Skip',
  doneLabel: isArabic ? 'إنهاء' : 'Done',
  showProgress: true,           // Show progress bar
  showBullets: true,            // Show step bullets
  exitOnOverlayClick: false,    // Don't exit on overlay click
  exitOnEsc: true,              // Allow ESC key to exit
  scrollToElement: true,        // Auto-scroll to elements
  scrollPadding: 30,            // Padding when scrolling
  disableInteraction: false,    // Allow interaction with elements
  overlayOpacity: 0.8,          // Overlay darkness (0-1)
});
```

## Browser Compatibility

The implementation uses:
- Modern JavaScript (ES6+)
- React Hooks
- localStorage API
- CSS3 for styling

**Supported Browsers**:
- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+

## Testing

### Manual Testing Checklist
- [ ] Tour starts automatically on first visit
- [ ] Tour can be skipped using "Skip" button
- [ ] Tour can be completed using "Done" button
- [ ] Tour doesn't show again after completion
- [ ] "Start Tour" button restarts the tour
- [ ] Arabic labels display correctly
- [ ] RTL layout works properly in Arabic
- [ ] All tooltips point to correct elements
- [ ] Tooltips are readable and properly styled
- [ ] Progress bar and bullets work correctly

### Testing Procedure
1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Verify tour starts automatically
4. Test all navigation buttons
5. Complete or skip the tour
6. Verify it doesn't restart automatically
7. Click "Start Tour" button
8. Verify tour restarts from beginning
9. Switch to Arabic locale and repeat

## Future Enhancements

Possible improvements for future iterations:
1. Add more detailed steps for specific sections (e.g., student management)
2. Context-aware tours based on user role/permissions
3. Video tutorials embedded in tour steps
4. Tour completion analytics
5. Multi-page tours (continue across different sections)
6. Interactive quizzes or tasks within the tour
7. Tour customization settings for users
8. Help center integration

## Troubleshooting

### Tour Doesn't Start
1. Check browser console for errors
2. Verify intro.js is loaded: `window.introJs`
3. Clear localStorage and try again
4. Check if elements exist: `document.querySelector('.admin-dashboard-header')`

### RTL Not Working
1. Verify locale is 'ar-SA'
2. Check if custom CSS is loaded
3. Inspect tooltip classes in browser DevTools

### Tour Starts Every Time
1. Check localStorage: `localStorage.getItem('admin-dashboard-tour')`
2. Verify localStorage is enabled in browser
3. Check for localStorage clearing code

## Dependencies

```json
{
  "intro.js": "^8.3.2"
}
```

## Related Files

- `/src/hooks/useGuidedTour.ts` - Hook implementation
- `/src/styles/guided-tour.css` - Custom styling
- `/src/app/[locale]/admin/components/dashboard/AdminDashboard.tsx` - Integration
- `/node_modules/intro.js/introjs.css` - Base intro.js styles

## References

- [Intro.js Documentation](https://introjs.com/docs)
- [Intro.js GitHub](https://github.com/usablica/intro.js)
- [React Hooks Documentation](https://react.dev/reference/react)
