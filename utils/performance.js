// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.isEnabled = __DEV__; // Only enable in development
  }

  startTimer(name) {
    if (!this.isEnabled) return;
    this.metrics[name] = {
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
  }

  endTimer(name) {
    if (!this.isEnabled || !this.metrics[name]) return;
    
    this.metrics[name].endTime = performance.now();
    this.metrics[name].duration = this.metrics[name].endTime - this.metrics[name].startTime;
    
    // Log slow operations
    if (this.metrics[name].duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${this.metrics[name].duration.toFixed(2)}ms`);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = {};
  }

  // Monitor component render performance
  monitorRender(componentName, renderFunction) {
    if (!this.isEnabled) return renderFunction();
    
    this.startTimer(`${componentName}_render`);
    const result = renderFunction();
    this.endTimer(`${componentName}_render`);
    
    return result;
  }

  // Monitor async operations
  async monitorAsync(name, asyncFunction) {
    if (!this.isEnabled) return asyncFunction();
    
    this.startTimer(name);
    try {
      const result = await asyncFunction();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// HOC for monitoring component performance
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    const renderWithMonitoring = () => (
      <WrappedComponent {...props} ref={ref} />
    );
    
    return performanceMonitor.monitorRender(componentName, renderWithMonitoring);
  });
}; 