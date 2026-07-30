# CDN Strategy for Global Publishing Platform

## Architecture Design
To serve 20-30TB of PDFs globally with minimum latency, we implement a multi-tier CDN architecture (Cloudflare or AWS CloudFront) placed in front of our NGINX ingress.

### Static Assets (Images, Metadata)
- **Cache-Control**: `public, max-age=31536000, immutable`
- **Invalidation**: Cache invalidation is triggered programmatically only when an asset is explicitly updated (rare for published metadata).

### PDF Streaming Optimization
- **Range Requests**: The CDN MUST support HTTP Range requests. 
- **Chunk Caching**: By utilizing sliced reads, the CDN caches 2MB chunks of the PDF instead of the entire 150MB file, preventing cache thrashing.
- **Cache-Control**: `public, max-age=86400` (1 day).

### Dynamic API Routes
- Route: `/api/*`
- **Cache-Control**: `no-store, max-age=0`
- **DDoS Protection**: Rate limiting is applied at the CDN edge (e.g., max 100 requests / IP / minute).
