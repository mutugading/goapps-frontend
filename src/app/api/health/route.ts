import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Kubernetes probes
 * Used by:
 * - livenessProbe: Check if container is alive
 * - readinessProbe: Check if container is ready to receive traffic
 */
export async function GET() {
    return NextResponse.json(
        {
            status: 'healthy',
            timestamp: new Date().toISOString()
        },
        { status: 200 }
    );
}
