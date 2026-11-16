'use strict';

/** Decode both SDK results and LibreChat's [formatted content, artifacts] tuple. */
function unwrapMcpResult(result) {
  if (result == null) return null;
  if (typeof result === 'string') {
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      // Plain tool text is intentional; it is not a navigation acknowledgement.
      return { text: result };
    }
    return unwrapMcpResult(parsed);
  }
  if (Array.isArray(result)) return unwrapMcpResult(result[0]);
  if (typeof result !== 'object') return result;
  if (result.structuredContent && typeof result.structuredContent === 'object') {
    return result.structuredContent;
  }
  if (Array.isArray(result.content)) {
    const first =
      result.content.find((part) => typeof part?.text === 'string') || result.content[0];
    return unwrapMcpResult(first?.text ?? first);
  }
  if (result.type === 'text' && typeof result.text === 'string') {
    return unwrapMcpResult(result.text);
  }
  return result;
}

module.exports = { unwrapMcpResult };
