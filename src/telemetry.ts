/**
 * Simple telemetry system for operation performance tracking
 */

export interface OperationMetrics {
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'started' | 'completed' | 'failed';
  error?: string;
}

export class Telemetry {
  private metrics: Map<string, OperationMetrics> = new Map();
  private operationCount: number = 0;

  /**
   * Start timing an operation
   */
  startOperation(operationName: string): string {
    const operationId = `${operationName}-${Date.now()}-${this.operationCount++}`;
    this.metrics.set(operationId, {
      operationName,
      startTime: Date.now(),
      status: 'started',
    });
    return operationId;
  }

  /**
   * Mark operation as completed and record duration
   */
  endOperation(operationId: string, error?: string): OperationMetrics | null {
    const metric = this.metrics.get(operationId);
    if (!metric) {
      return null;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.status = error ? 'failed' : 'completed';
    if (error) {
      metric.error = error;
    }

    return metric;
  }

  /**
   * Get all metrics
   */
  getMetrics(): OperationMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get statistics for a specific operation
   */
  getOperationStats(operationName: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
  } | null {
    const opMetrics = Array.from(this.metrics.values()).filter((m) => m.operationName === operationName && m.duration !== undefined);

    if (opMetrics.length === 0) {
      return null;
    }

    const durations = opMetrics.map((m) => m.duration || 0);
    const successCount = opMetrics.filter((m) => m.status === 'completed').length;

    return {
      count: opMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / opMetrics.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / opMetrics.length) * 100,
    };
  }

  /**
   * Clear old metrics (keep last N entries per operation)
   */
  prune(maxEntriesPerOp: number = 100): void {
    const byOperation = new Map<string, OperationMetrics[]>();

    for (const metric of this.metrics.values()) {
      if (!byOperation.has(metric.operationName)) {
        byOperation.set(metric.operationName, []);
      }
      byOperation.get(metric.operationName)!.push(metric);
    }

    for (const [opName, metrics] of byOperation.entries()) {
      if (metrics.length > maxEntriesPerOp) {
        const toRemove = metrics.length - maxEntriesPerOp;
        const sorted = metrics.sort((a, b) => a.startTime - b.startTime);
        for (let i = 0; i < toRemove; i++) {
          const id = `${sorted[i].operationName}-${sorted[i].startTime}`;
          // Find and remove the metric
          for (const [key, metric] of this.metrics.entries()) {
            if (metric.startTime === sorted[i].startTime && metric.operationName === opName) {
              this.metrics.delete(key);
              break;
            }
          }
        }
      }
    }
  }
}

export default Telemetry;
