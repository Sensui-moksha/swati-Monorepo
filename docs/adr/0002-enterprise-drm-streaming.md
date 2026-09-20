# ADR 0002: Enterprise DRM and Non-Destructive Stream Watermarking

## Status
Accepted

## Context
Swathi Publications hosts valuable Telugu literary heritage, serialized fiction, and magazines. Digital piracy and unauthorized screen captures pose risks to authors and business viability. Traditional DRM (e.g. Adobe Content Server) requires heavy proprietary client plugins that degrade reader user experience. Modifying the original master PDF files on disk to add user watermarks is unacceptable due to storage multiplication and irreversible alteration.

## Decision
1. **Zero-Touch Master Storage**: Original high-resolution PDF archives are stored immutably on disk/S3 and are never altered.
2. **Ephemeral Stream Watermarking**: Watermarking is rendered on-the-fly during PDF byte streaming using canvas/stream injection with reader identity, order reference, IP, and timestamp.
3. **Invisible Steganographic IDs**: Embed cryptographically verifiable invisible tracking IDs in font/metadata stream payloads to trace leaked screenshots or offline exports back to the originating user account.
4. **Signed Ephemeral Streaming URLs**: Stream access requires short-lived (60s) HMAC-SHA256 tokens tied to the authenticated user ID and client IP.
5. **Concurrent Device Limits**: Users are bounded to a maximum of 3 concurrent active devices. Any 4th device registration requires explicit deauthorization of an existing device.

## Consequences
- Preserves master file purity with 0 disk amplification.
- Protects content transparently across mobile web, desktop, and PWA readers without requiring proprietary plugins.
- Bounded token life limits session hijacking risks.
