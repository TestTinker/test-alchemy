/**
 * Responsive swipe coordinates for small Android devices
 * Adjusted for truly small phones (e.g., Galaxy A series, older small devices)
 *
 * These conservative values work across different small phone resolutions:
 * - startY: 1200 (safe middle area of screen)
 * - distance: 1000 (sufficient for swiping up without exceeding bounds)
 */
export function getResponsiveSwipeCoords() {
  // Safe values for small Android phones with limited resolution
  // These work on devices like Galaxy A12 (~720x1600) and similar
  return {
    // Start from middle-to-lower area of screen
    startY: 1200,
    // Swipe distance - significant but safe for small screens
    distance: 1000,
  };
}
